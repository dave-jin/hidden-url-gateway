import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSecret } from "@/lib/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { createAdminSession } from "@/lib/session";

function sameSecret(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const limited = rateLimit(`admin:${clientKey(request.headers)}`, 6, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Password required." }, { status: 400 });
  }

  if (!sameSecret(password, getAdminSecret())) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
