import { getDb, hasDatabase } from "@/lib/db";
import type { DestinationKind, EventRecord } from "@/lib/types";

const seedEvent: EventRecord = {
  id: "grok-bot",
  name: "Grok Bot",
  tagline: "Credit Access",
  description:
    "Invitation-only credit desk for the Grok Bot event. Enter the email we registered for you.",
  logoPath: "/events/grok-bot/logo.svg",
  wordmarkPath: "/events/grok-bot/wordmark.svg",
  destinationKind: "internal",
  destinationUrl: "",
  internalPage: "grok-credits",
  emails: ["demo@spacexai.com", "grok@x.ai"],
  updatedAt: new Date(0).toISOString(),
};

type EventRow = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo_path: string;
  wordmark_path: string;
  destination_kind: DestinationKind;
  destination_url: string;
  internal_page: "grok-credits";
  updated_at: Date | string;
};

function toEvent(row: EventRow, emails: string[]): EventRecord {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    logoPath: row.logo_path,
    wordmarkPath: row.wordmark_path,
    destinationKind: row.destination_kind,
    destinationUrl: row.destination_url,
    internalPage: row.internal_page,
    emails,
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

export async function getActiveEvent(): Promise<EventRecord> {
  if (!hasDatabase()) {
    return seedEvent;
  }

  const rows = await getDb()<EventRow[]>`
    select id, name, tagline, description, logo_path, wordmark_path,
           destination_kind, destination_url, internal_page, updated_at
    from app_hidden_url_gateway.gateway_events
    where is_active = true
    order by updated_at desc
    limit 1
  `;
  const row = rows[0];
  if (!row) return seedEvent;

  const emails = await getDb()<{ email: string }[]>`
    select email from app_hidden_url_gateway.gateway_event_emails
    where event_id = ${row.id}
    order by email
  `;
  return toEvent(row, emails.map((item) => item.email));
}

export async function updateActiveEvent(
  patch: Partial<Omit<EventRecord, "id" | "internalPage">>,
) {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is required to save admin changes.");
  }

  const current = await getActiveEvent();
  const next: EventRecord = {
    ...current,
    ...patch,
    id: current.id,
    internalPage: "grok-credits",
    updatedAt: new Date().toISOString(),
  };

  await getDb()`
    insert into app_hidden_url_gateway.gateway_events (
      id, name, tagline, description, logo_path, wordmark_path,
      destination_kind, destination_url, internal_page, is_active, updated_at
    ) values (
      ${next.id}, ${next.name}, ${next.tagline}, ${next.description},
      ${next.logoPath}, ${next.wordmarkPath}, ${next.destinationKind},
      ${next.destinationUrl}, ${next.internalPage}, true, ${next.updatedAt}::timestamptz
    )
    on conflict (id) do update set
      name = excluded.name,
      tagline = excluded.tagline,
      description = excluded.description,
      logo_path = excluded.logo_path,
      wordmark_path = excluded.wordmark_path,
      destination_kind = excluded.destination_kind,
      destination_url = excluded.destination_url,
      internal_page = excluded.internal_page,
      is_active = true,
      updated_at = excluded.updated_at
  `;

  if (patch.emails) {
    await getDb()`
      delete from app_hidden_url_gateway.gateway_event_emails
      where event_id = ${next.id}
    `;
    for (const email of next.emails) {
      await getDb()`
        insert into app_hidden_url_gateway.gateway_event_emails (event_id, email)
        values (${next.id}, ${email})
      `;
    }
  }

  return getActiveEvent();
}

export async function saveEventAsset(params: {
  eventId: string;
  slot: "logo" | "wordmark";
  filename: string;
  bytes: Buffer;
  contentType: string;
}) {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is required to upload logos.");
  }

  const path = `${params.eventId}/${params.slot}-${Date.now()}-${params.filename}`;
  await getDb()`
    insert into app_hidden_url_gateway.assets (path, content_type, bytes)
    values (${path}, ${params.contentType}, ${params.bytes})
  `;
  const publicPath = `/api/brand/${encodeURIComponent(path)}`;
  await updateActiveEvent(
    params.slot === "wordmark" ? { wordmarkPath: publicPath } : { logoPath: publicPath },
  );
  return publicPath;
}

export async function readEventAsset(path: string) {
  if (!hasDatabase()) return null;
  const rows = await getDb()<{ content_type: string; bytes: Uint8Array }[]>`
    select content_type, bytes from app_hidden_url_gateway.assets
    where path = ${path}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    bytes: Buffer.from(row.bytes),
    contentType: row.content_type,
  };
}
