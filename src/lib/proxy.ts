export const RELAY_PREFIX = "/api/relay";

const ATTR_RE =
  /(href|src|action|poster|formaction|srcset|imagesrcset|data-src|data-href)=["']([^"']+)["']/gi;
const CSS_URL_RE = /url\((['"]?)(.*?)\1\)/gi;
const SRCSET_RE = /srcset=["']([^"']+)["']/gi;
const INTEGRITY_RE = /\s+integrity=["'][^"']*["']/gi;

export function resolveAgainst(base: string, value: string) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

export function originsFor(destinationUrl: string) {
  const destination = new URL(destinationUrl);
  const origins = new Set([destination.origin]);
  if (destination.hostname.startsWith("www.")) {
    origins.add(`${destination.protocol}//${destination.hostname.slice(4)}`);
  } else {
    origins.add(`${destination.protocol}//www.${destination.hostname}`);
  }
  return origins;
}

export function toRelayPath(destination: URL, candidate: URL) {
  if (!originsFor(destination.href).has(candidate.origin)) {
    return null;
  }

  return `${RELAY_PREFIX}${candidate.pathname}${candidate.search}${candidate.hash}`;
}

function rewriteValue(destinationUrl: string, raw: string) {
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
  return toRelayPath(new URL(destinationUrl), resolved) ?? raw;
}

export function rewriteCss(css: string, destinationUrl: string) {
  return hideDestination(css, destinationUrl).replace(
    CSS_URL_RE,
    (full, quote: string, value: string) => {
      const rewritten = rewriteValue(destinationUrl, value);
      return rewritten === value ? full : `url(${quote}${rewritten}${quote})`;
    },
  );
}

export function rewriteJs(js: string, destinationUrl: string) {
  return hideDestination(js, destinationUrl);
}

function hideDestination(content: string, destinationUrl: string) {
  let next = content;
  for (const origin of originsFor(destinationUrl)) {
    next = next.split(origin).join("");
  }
  next = next.replace(/(["'`])\/_next\//g, `$1${RELAY_PREFIX}/_next/`);
  return next;
}

export function rewriteHtml(html: string, destinationUrl: string) {
  const destination = new URL(destinationUrl);

  let next = html.replace(ATTR_RE, (full, attr: string, value: string) => {
    if (attr === "srcset" || attr === "imagesrcset") {
      const rewritten = value
        .split(",")
        .map((part) => {
          const [url, descriptor] = part.trim().split(/\s+/, 2);
          if (!url) return part;
          const mapped = rewriteValue(destinationUrl, url);
          return descriptor ? `${mapped} ${descriptor}` : mapped;
        })
        .join(", ");
      return `${attr}="${rewritten}"`;
    }
    const rewritten = rewriteValue(destinationUrl, value);
    return rewritten === value ? full : `${attr}="${rewritten}"`;
  });

  next = next.replace(SRCSET_RE, (full, value: string) => {
    const rewritten = value
      .split(",")
      .map((part) => {
        const [url, descriptor] = part.trim().split(/\s+/, 2);
        if (!url) return part;
        const mapped = rewriteValue(destinationUrl, url);
        return descriptor ? `${mapped} ${descriptor}` : mapped;
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  });

  next = next.replace(CSS_URL_RE, (full, quote: string, value: string) => {
    const rewritten = rewriteValue(destinationUrl, value);
    return rewritten === value ? full : `url(${quote}${rewritten}${quote})`;
  });

  next = next.replace(INTEGRITY_RE, "");
  next = hideDestination(next, destination.href);
  next = next.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  next = next.replace(
    /<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi,
    "",
  );

  if (/<head[^>]*>/i.test(next)) {
    next = next.replace(/<head([^>]*)>/i, `<head$1><base href="${RELAY_PREFIX}/">`);
  }

  return next;
}

export function rewriteLocation(location: string, destinationUrl: string) {
  const destination = new URL(destinationUrl);
  const resolved = resolveAgainst(destinationUrl, location);
  if (!resolved) return `${RELAY_PREFIX}/`;
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
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
  "set-cookie",
  "report-to",
  "nel",
]);

export function filterResponseHeaders(headers: Headers) {
  const next = new Headers();
  headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "location") return;
    next.set(key, value);
  });
  next.set("referrer-policy", "no-referrer");
  next.set("x-frame-options", "SAMEORIGIN");
  return next;
}

export function normalizeDestinationUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
