import { NextResponse } from "next/server";
import { parseEmailList } from "@/lib/emails";
import { isUsingDevSecrets } from "@/lib/env";
import { getAdminSession } from "@/lib/session";
import { getActiveEvent, updateActiveEvent } from "@/lib/store";
import type { DestinationKind } from "@/lib/types";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getActiveEvent();
  return NextResponse.json({
    event,
    meta: {
      allowlistCount: event.emails.length,
      usingDevSecrets: isUsingDevSecrets(),
    },
  });
}

export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    tagline?: string;
    description?: string;
    destinationKind?: DestinationKind;
    destinationUrl?: string;
    emailsText?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const destinationKind = body.destinationKind === "external" ? "external" : "internal";
  const destinationUrl = (body.destinationUrl ?? "").trim();

  if (destinationKind === "external") {
    try {
      const parsed = new URL(destinationUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "External destination must be a full http(s) URL." },
        { status: 400 },
      );
    }
  }

  const event = await updateActiveEvent({
    name: (body.name ?? "").trim() || "Untitled event",
    tagline: (body.tagline ?? "").trim(),
    description: (body.description ?? "").trim(),
    destinationKind,
    destinationUrl: destinationKind === "external" ? destinationUrl : "",
    emails: parseEmailList(body.emailsText ?? ""),
  });

  return NextResponse.json({ event });
}
