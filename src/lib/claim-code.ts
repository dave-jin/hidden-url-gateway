import { createHmac } from "node:crypto";
import { getSessionSecret } from "@/lib/env";

export function claimCodeFor(email: string, eventId = "event") {
  const digest = createHmac("sha256", getSessionSecret())
    .update(`${eventId}:${email}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `PASS-${digest.slice(0, 4)}-${digest.slice(4, 8)}-${digest.slice(8, 12)}`;
}
