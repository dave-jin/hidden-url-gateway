import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getActiveEvent, saveEventAsset } from "@/lib/store";

const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("logo");
  const slot = form.get("slot") === "wordmark" ? "wordmark" : "logo";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Logo must be under 2MB." }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Use PNG, JPG, WEBP, or SVG." }, { status: 400 });
  }

  const event = await getActiveEvent();
  await saveEventAsset({
    eventId: event.id,
    slot,
    filename: `${slot}.${ext}`,
    bytes: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  return NextResponse.json({ event: await getActiveEvent() });
}
