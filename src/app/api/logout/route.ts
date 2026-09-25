import { NextResponse } from "next/server";
import { clearGateSession } from "@/lib/session";

export async function POST() {
  await clearGateSession();
  return NextResponse.json({ ok: true });
}
