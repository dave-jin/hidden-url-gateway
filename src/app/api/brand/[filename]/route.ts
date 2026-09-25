import { NextResponse } from "next/server";
import { readEventAsset } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const path = decodeURIComponent(filename);
  if (path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const asset = await readEventAsset(path);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(asset.bytes, {
    headers: {
      "content-type": asset.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
