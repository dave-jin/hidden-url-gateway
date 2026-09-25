import { NextResponse } from "next/server";
import { isAllowlisted, isValidEmail, normalizeEmail } from "@/lib/emails";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { createGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";

export async function POST(request: Request) {
  const limited = rateLimit(`gate:${clientKey(request.headers)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = normalizeEmail(body.email ?? "");
  } catch {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const event = await getActiveEvent();
  if (!isAllowlisted(email, event.emails)) {
    return NextResponse.json(
      { error: "That email is not on the invited list." },
      { status: 403 },
    );
  }

  await createGateSession(email, event.id);
  return NextResponse.json({ ok: true });
}
