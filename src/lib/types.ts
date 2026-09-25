export type DestinationKind = "internal" | "external";

export type EventRecord = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoPath: string;
  wordmarkPath: string;
  destinationKind: DestinationKind;
  destinationUrl: string;
  internalPage: "grok-credits";
  emails: string[];
  updatedAt: string;
};

export type StoreData = {
  activeEventId: string;
  events: EventRecord[];
};

export type PublicEvent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoPath: string;
  wordmarkPath: string;
};

export type GateSession = {
  email: string;
  eventId: string;
  exp: number;
};

export type AdminSession = {
  role: "admin";
  exp: number;
};
