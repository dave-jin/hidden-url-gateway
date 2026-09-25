import { NextResponse } from "next/server";
import {
  filterResponseHeaders,
  rewriteCss,
  rewriteHtml,
  rewriteJs,
  rewriteLocation,
} from "@/lib/proxy";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";

export const maxDuration = 30;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function errorPage(status: number, title: string, detail: string) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07080A;color:#f5f2ea;font-family:ui-sans-serif,system-ui;padding:24px}main{max-width:28rem;text-align:center}p{color:#b7b1a3;line-height:1.6}</style>
</head><body><main><p style="letter-spacing:.28em;text-transform:uppercase;font-size:11px;color:#c6aa6a">Hidden desk</p>
<h1 style="font-size:22px">${title}</h1><p>${detail}</p></main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function buildTarget(destination: URL, path: string[], requestUrl: URL) {
  const target = new URL(destination.href);
  if (path[0] === "sub") {
    const relative = requestUrl.searchParams.get("p") ?? "/";
    const resolved = new URL(relative, destination.origin);
    if (resolved.origin !== destination.origin) return null;
    return resolved;
  }
  if (path.length > 0) {
    target.pathname = `/${path.map((part) => decodeURIComponent(part)).join("/")}`;
    target.search = requestUrl.search;
    return target;
  }
  target.search = requestUrl.search;
  return target;
}

async function relay(request: Request, path: string[]) {
  const session = await getGateSession();
  if (!session) {
    return errorPage(401, "Session locked", "Enter the invited email on the gate first.");
  }

  const event = await getActiveEvent();
  if (event.id !== session.eventId) {
    return errorPage(401, "Session locked", "This session does not match the active event.");
  }
  if (event.destinationKind !== "external" || !event.destinationUrl) {
    return errorPage(404, "No hidden page", "The admin has not set an external destination yet.");
  }

  let destination: URL;
  try {
    destination = new URL(event.destinationUrl);
  } catch {
    return errorPage(500, "Invalid destination", "The stored destination URL could not be parsed.");
  }

  const requestUrl = new URL(request.url);
  const target = buildTarget(destination, path, requestUrl);
  if (!target) {
    return errorPage(400, "Blocked", "That asset is outside the hidden destination.");
  }

  const incoming = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  const language = request.headers.get("accept-language");
  if (accept) incoming.set("accept", accept);
  if (contentType) incoming.set("content-type", contentType);
  if (language) incoming.set("accept-language", language);
  incoming.set("user-agent", BROWSER_UA);

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  let body: ArrayBuffer | undefined;
  if (hasBody) {
    body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers: incoming,
      body,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream request failed.";
    return errorPage(502, "Destination unreachable", message);
  }

  const rewriteBase = upstream.url || destination.href;
  const headers = filterResponseHeaders(upstream.headers);
  const location = upstream.headers.get("location");
  if (location) {
    headers.set("location", rewriteLocation(location, rewriteBase));
  }

  const mime = upstream.headers.get("content-type") ?? "";
  if (mime.includes("text/html")) {
    const html = await upstream.text();
    const rewritten = rewriteHtml(html, rewriteBase);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new NextResponse(rewritten, { status: upstream.status, headers });
  }
  if (mime.includes("text/css")) {
    const css = await upstream.text();
    headers.set("content-type", "text/css; charset=utf-8");
    headers.set("cache-control", "private, max-age=60");
    return new NextResponse(rewriteCss(css, rewriteBase), { status: upstream.status, headers });
  }
  if (
    mime.includes("javascript") ||
    mime.includes("ecmascript") ||
    target.pathname.endsWith(".js")
  ) {
    const js = await upstream.text();
    headers.set("content-type", mime || "application/javascript; charset=utf-8");
    headers.set("cache-control", "private, max-age=60");
    return new NextResponse(rewriteJs(js, rewriteBase), { status: upstream.status, headers });
  }

  const bytes = await upstream.arrayBuffer();
  headers.set("cache-control", "private, max-age=60");
  return new NextResponse(bytes, { status: upstream.status, headers });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  return relay(request, path);
}
