const ATTR_RE =
  /(href|src|action|poster|formaction)=["']([^"']+)["']/gi;
const CSS_URL_RE = /url\((['"]?)(.*?)\1\)/gi;
const SRCSET_RE = /srcset=["']([^"']+)["']/gi;

export function resolveAgainst(base: string, value: string) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

export function toRelayPath(destination: URL, candidate: URL) {
  if (candidate.origin !== destination.origin) {
    return null;
  }

  const destKey = destination.pathname + destination.search;
  const candKey = candidate.pathname + candidate.search;
  if (candKey === destKey || candidate.href === destination.href) {
    return "/api/relay";
  }

  return `/api/relay/sub?p=${encodeURIComponent(candidate.pathname + candidate.search + candidate.hash)}`;
}

export function rewriteHtml(html: string, destinationUrl: string) {
  const destination = new URL(destinationUrl);

  const rewriteValue = (raw: string) => {
    const trimmed = raw.trim();
    if (
      !trimmed ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("#")
    ) {
      return raw;
    }
    const resolved = resolveAgainst(destinationUrl, trimmed);
    if (!resolved) return raw;
    return toRelayPath(destination, resolved) ?? raw;
  };

  let next = html.replace(ATTR_RE, (full, attr: string, value: string) => {
    const rewritten = rewriteValue(value);
    return rewritten === value ? full : `${attr}="${rewritten}"`;
  });

  next = next.replace(SRCSET_RE, (full, value: string) => {
    const rewritten = value
      .split(",")
      .map((part) => {
        const [url, descriptor] = part.trim().split(/\s+/, 2);
        if (!url) return part;
        const mapped = rewriteValue(url);
        return descriptor ? `${mapped} ${descriptor}` : mapped;
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  });

  next = next.replace(CSS_URL_RE, (full, quote: string, value: string) => {
    const rewritten = rewriteValue(value);
    return rewritten === value ? full : `url(${quote}${rewritten}${quote})`;
  });

  if (!/<base\s/i.test(next)) {
    next = next.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="/api/relay">`,
    );
  }

  return next;
}

export function rewriteLocation(location: string, destinationUrl: string) {
  const destination = new URL(destinationUrl);
  const resolved = resolveAgainst(destinationUrl, location);
  if (!resolved) return "/api/relay";
  return toRelayPath(destination, resolved) ?? "/view";
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
]);

export function filterResponseHeaders(headers: Headers) {
  const next = new Headers();
  headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return;
    if (key.toLowerCase() === "location") return;
    next.set(key, value);
  });
  next.set("referrer-policy", "no-referrer");
  next.set("x-frame-options", "SAMEORIGIN");
  return next;
}
