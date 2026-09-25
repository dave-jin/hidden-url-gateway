import type { EventRecord, PublicEvent } from "@/lib/types";

export function toPublicEvent(event: EventRecord): PublicEvent {
  return {
    id: event.id,
    name: event.name,
    tagline: event.tagline,
    description: event.description,
    logoPath: event.logoPath,
    wordmarkPath: event.wordmarkPath,
  };
}

export function maskDestination(url: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}/…`;
  } catch {
    return "configured";
  }
}
