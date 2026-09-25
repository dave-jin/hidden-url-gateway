import { NextResponse } from "next/server";
import { filterResponseHeaders, rewriteHtml, rewriteLocation } from "@/lib/proxy";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";

async function relay(request: Request, path: string[], searchParams: URLSearchParams) {
  const session = await getGateSession();
  if (!session) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const event = await getActiveEvent();
  if (event.id !== session.eventId) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  if (event.destinationKind !== "external" || !event.destinationUrl) {
    return NextResponse.json({ error: "No external destination." }, { status: 404 });
  }

  let destination: URL;
  try {
    destination = new URL(event.destinationUrl);
  } catch {
    return NextResponse.json({ error: "Invalid destination." }, { status: 500 });
  }

  const target = new URL(destination.href);
  if (path[0] === "sub") {
    const relative = searchParams.get("p") ?? "/";
    const resolved = new URL(relative, destination.origin);
    if (resolved.origin !== destination.origin) {
      return NextResponse.json({ error: "Blocked" }, { status: 400 });
    }
    target.href = resolved.href;
  }

  const incoming = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  if (accept) incoming.set("accept", accept);
  if (contentType) incoming.set("content-type", contentType);
  incoming.set("user-agent", "HiddenURLGateway/1.0");

  const method = request.method === "GET" || request.method === "HEAD" ? request.method : "GET";
  const upstream = await fetch(target, {
    method,
    headers: incoming,
    redirect: "manual",
    cache: "no-store",
  });

  const headers = filterResponseHeaders(upstream.headers);
  const location = upstream.headers.get("location");
  if (location) {
    headers.set("location", rewriteLocation(location, destination.href));
  }

  const mime = upstream.headers.get("content-type") ?? "";
  if (mime.includes("text/html")) {
    const html = await upstream.text();
    const rewritten = rewriteHtml(html, destination.href);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new NextResponse(rewritten, { status: upstream.status, headers });
  }

  const body = await upstream.arrayBuffer();
  headers.set("cache-control", "private, max-age=60");
  return new NextResponse(body, { status: upstream.status, headers });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const url = new URL(request.url);
  return relay(request, path, url.searchParams);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const url = new URL(request.url);
  return relay(request, path, url.searchParams);
}
