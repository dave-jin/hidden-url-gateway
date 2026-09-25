import { normalizeDestinationUrl } from "@/lib/proxy";

export type EventClaimState =
  | "EVENT_CODE_CLAIM_STATE_UPCOMING"
  | "EVENT_CODE_CLAIM_STATE_OPEN"
  | "EVENT_CODE_CLAIM_STATE_FULL"
  | "EVENT_CODE_CLAIM_STATE_CLOSED"
  | "EVENT_CODE_CLAIM_STATE_DISABLED";

export type EventCodeInfo =
  | { found: false }
  | {
      found: true;
      eventName: string;
      creditCents: number;
      claimState: EventClaimState;
      claimStartsAtMs: number;
      claimEndsAtMs: number;
      creditTtlDays: number;
      creditDestination: string;
    };

const CLAIM_STATES = new Set<EventClaimState>([
  "EVENT_CODE_CLAIM_STATE_UPCOMING",
  "EVENT_CODE_CLAIM_STATE_OPEN",
  "EVENT_CODE_CLAIM_STATE_FULL",
  "EVENT_CODE_CLAIM_STATE_CLOSED",
  "EVENT_CODE_CLAIM_STATE_DISABLED",
]);

export function canContinueClaim(info: EventCodeInfo | null) {
  return Boolean(info && info.found && info.claimState === "EVENT_CODE_CLAIM_STATE_OPEN");
}

export function continueDestinationUrl(destinationUrl: string | null | undefined) {
  if (!destinationUrl) return null;
  const normalized = normalizeDestinationUrl(destinationUrl);
  if (!parseCursorRedeemCode(normalized)) return null;
  return normalized;
}

export function parseCursorRedeemCode(destinationUrl: string) {
  try {
    const url = new URL(destinationUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "cursor.com") return null;
    const match = url.pathname.match(/^\/redeem\/event\/([^/]+)\/?$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function asCount(value: unknown, label: string) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label}`);
  }
  return parsed;
}

function parseInfo(body: unknown): EventCodeInfo {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid event code info response");
  }
  const data = body as Record<string, unknown>;
  if (data.found === false) return { found: false };
  if (data.found !== true) {
    throw new Error("Invalid event code info response");
  }
  if (typeof data.eventName !== "string" || !data.eventName.trim()) {
    throw new Error("Invalid event name");
  }
  const claimState = data.claimState;
  if (typeof claimState !== "string" || !CLAIM_STATES.has(claimState as EventClaimState)) {
    throw new Error("Invalid claim state");
  }
  return {
    found: true,
    eventName: data.eventName.trim(),
    creditCents: asCount(data.creditCents, "creditCents"),
    claimState: claimState as EventClaimState,
    claimStartsAtMs: asCount(data.claimStartsAtMs, "claimStartsAtMs"),
    claimEndsAtMs: asCount(data.claimEndsAtMs, "claimEndsAtMs"),
    creditTtlDays: asCount(data.creditTtlDays, "creditTtlDays"),
    creditDestination: typeof data.creditDestination === "string" ? data.creditDestination : "",
  };
}

export async function fetchEventCodeInfo(code: string): Promise<EventCodeInfo> {
  const response = await fetch("https://cursor.com/api/dashboard/event-code-info", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://cursor.com",
      referer: `https://cursor.com/redeem/event/${encodeURIComponent(code)}`,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Event lookup failed (${response.status})`);
  }
  return parseInfo(await response.json());
}

export function formatCredit(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatClaimInstant(ms: number) {
  if (!ms) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(ms));
}

export function claimStateLabel(state: EventClaimState, startsAtMs: number) {
  switch (state) {
    case "EVENT_CODE_CLAIM_STATE_UPCOMING":
      return startsAtMs ? `Claims open ${formatClaimInstant(startsAtMs)}` : "Claims open soon";
    case "EVENT_CODE_CLAIM_STATE_OPEN":
      return "Claims are open";
    case "EVENT_CODE_CLAIM_STATE_FULL":
      return "This event has reached its claim limit";
    case "EVENT_CODE_CLAIM_STATE_CLOSED":
      return "The claim window has ended";
    case "EVENT_CODE_CLAIM_STATE_DISABLED":
      return "This event code is not active";
  }
}
