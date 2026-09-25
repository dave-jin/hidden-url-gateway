import { NextResponse } from "next/server";
import { toPublicEvent } from "@/lib/public-event";
import { getActiveEvent } from "@/lib/store";

export async function GET() {
  const event = await getActiveEvent();
  return NextResponse.json(toPublicEvent(event));
}
