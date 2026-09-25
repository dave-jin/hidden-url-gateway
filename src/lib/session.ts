import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/env";
import type { AdminSession, GateSession } from "@/lib/types";

export const GATE_COOKIE = "gate_session";
export const ADMIN_COOKIE = "admin_session";

const GATE_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_TTL_MS = 1000 * 60 * 60 * 8;

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encode<T>(payload: T) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & {
      exp?: number;
    };
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createGateSession(email: string, eventId: string) {
  const payload: GateSession = {
    email,
    eventId,
    exp: Date.now() + GATE_TTL_MS,
  };
  const jar = await cookies();
  jar.set(GATE_COOKIE, encode(payload), cookieOptions(Math.floor(GATE_TTL_MS / 1000)));
}

export async function clearGateSession() {
  const jar = await cookies();
  jar.delete(GATE_COOKIE);
}

export async function getGateSession() {
  const jar = await cookies();
  return decode<GateSession>(jar.get(GATE_COOKIE)?.value);
}

export async function createAdminSession() {
  const payload: AdminSession = {
    role: "admin",
    exp: Date.now() + ADMIN_TTL_MS,
  };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encode(payload), cookieOptions(Math.floor(ADMIN_TTL_MS / 1000)));
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  const session = decode<AdminSession>(jar.get(ADMIN_COOKIE)?.value);
  return session?.role === "admin" ? session : null;
}
