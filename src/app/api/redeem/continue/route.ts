import { NextResponse } from "next/server";
import { continueDestinationUrl } from "@/lib/cursor-redeem";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";

export const dynamic = "force-dynamic";

async function continueToCursor(request: Request) {
  const session = await getGateSession();
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const event = await getActiveEvent();
  if (event.id !== session.eventId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const destination = continueDestinationUrl(event.destinationUrl);
  if (event.destinationKind !== "external" || !destination) {
    return NextResponse.redirect(new URL("/view", request.url));
  }

  const response = NextResponse.redirect(destination, 303);
  response.headers.set("referrer-policy", "no-referrer");
  return response;
}

export async function POST(request: Request) {
  return continueToCursor(request);
}

export async function GET(request: Request) {
  return continueToCursor(request);
}
