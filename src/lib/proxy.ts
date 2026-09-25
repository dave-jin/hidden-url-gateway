export const RELAY_PREFIX = "/api/relay";

export const RSC_REQUEST_HEADERS = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
  "next-url",
] as const;

const ATTR_RE =
  /(href|src|action|poster|formaction|srcset|imagesrcset|data-src|data-href)=["']([^"']+)["']/gi;
const CSS_URL_RE = /url\((['"]?)(.*?)\1\)/gi;
const SRCSET_RE = /srcset=["']([^"']+)["']/gi;
const INTEGRITY_RE = /\s+integrity=["'][^"']+["']/gi;
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;

export function resolveAgainst(base: string, value: string) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

export function originsFor(destinationUrl: string) {
  const destination = new URL(destinationUrl);
  const hosts = new Set([destination.host]);
  if (destination.hostname.startsWith("www.")) {
    hosts.add(destination.host.replace(/^www\./, ""));
  } else {
    hosts.add(`www.${destination.host}`);
  }
  const origins = new Set<string>();
  for (const host of hosts) {
    origins.add(`https://${host}`);
    origins.add(`http://${host}`);
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
  return rewriteScriptPayload(js, destinationUrl);
}

function prefixNextAssets(content: string) {
  return content.replace(/(?<!\/api\/relay)\/_next\//g, `${RELAY_PREFIX}/_next/`);
}

export function hideDestination(content: string, destinationUrl: string) {
  let next = content;
  for (const origin of originsFor(destinationUrl)) {
    next = next.split(origin).join(RELAY_PREFIX);
  }
  return prefixNextAssets(next);
}

function rewriteScriptPayload(content: string, destinationUrl: string) {
  let next = content;
  for (const origin of originsFor(destinationUrl)) {
    next = next.split(`${origin}/_next/`).join(`${RELAY_PREFIX}/_next/`);
    next = next.split(`${origin}/api/`).join(`${RELAY_PREFIX}/api/`);
  }
  return prefixNextAssets(next);
}

function hideOriginsOutsideScripts(html: string, destinationUrl: string) {
  const parts = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi);
  return parts
    .map((part) => {
      if (/^<script\b/i.test(part)) {
        return rewriteScriptPayload(part, destinationUrl);
      }
      return hideDestination(part, destinationUrl);
    })
    .join("");
}

export function visibleTextFromHtml(html: string) {
  const withoutChrome = html
    .replace(SCRIPT_RE, "")
    .replace(STYLE_RE, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  const body = /<body[\s\S]*$/i.test(withoutChrome)
    ? withoutChrome.replace(/^[\s\S]*<body[^>]*>/i, "")
    : withoutChrome;
  return body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function htmlLooksPrerendered(html: string) {
  const text = visibleTextFromHtml(html);
  if (text.length < 80) return false;
  if (/^loading\.?/i.test(text) && text.length < 160) return false;
  return true;
}

export function relayFrameSrc(destinationUrl: string) {
  try {
    const url = new URL(destinationUrl);
    const path = `${url.pathname}${url.search}` || "/";
    return path === "/" ? RELAY_PREFIX : path;
  } catch {
    return RELAY_PREFIX;
  }
}

function relayBootstrap(destinationUrl: string) {
  const hosts = [
    ...new Set([...originsFor(destinationUrl)].map((origin) => new URL(origin).hostname)),
  ];
  const encodedHosts = Buffer.from(JSON.stringify(hosts)).toString("base64");
  return `<script data-gateway-bootstrap>
(function(){
  var prefix=${JSON.stringify(RELAY_PREFIX)};
  var hosts=JSON.parse(atob(${JSON.stringify(encodedHosts)}));
  function mapUrl(value){
    try {
      var href = typeof value==="string" ? value : (value && value.url);
      if (!href) return value;
      var url = new URL(href, location.href);
      if (hosts.indexOf(url.hostname) !== -1) {
        return location.origin + prefix + url.pathname + url.search + url.hash;
      }
      if (url.origin !== location.origin) return value;
      if (url.pathname === prefix || url.pathname.indexOf(prefix + "/") === 0) return value;
      if (url.pathname === "/view" || url.pathname.indexOf("/admin") === 0) return value;
      return location.origin + prefix + url.pathname + url.search + url.hash;
    } catch (e) {}
    return value;
  }
  function copyHeaders(headers){
    var next = new Headers();
    if (!headers) return next;
    if (headers.forEach) {
      headers.forEach(function(value, key){ next.set(key, value); });
      return next;
    }
    if (Array.isArray(headers)) {
      headers.forEach(function(pair){ next.set(pair[0], pair[1]); });
      return next;
    }
    Object.keys(headers).forEach(function(key){ next.set(key, headers[key]); });
    return next;
  }
  function detachRsc(input, init){
    var headers = copyHeaders(init && init.headers);
    if (typeof Request !== "undefined" && input instanceof Request) {
      input.headers.forEach(function(value, key){
        if (!headers.has(key)) headers.set(key, value);
      });
    }
    ["rsc","next-router-state-tree","next-router-prefetch","next-router-segment-prefetch","next-url"].forEach(function(key){
      var value = headers.get(key);
      if (value) {
        headers.set("x-gateway-" + key, value);
        headers.delete(key);
      }
    });
    return headers;
  }
  var origFetch = window.fetch;
  window.fetch = function(input, init){
    var url = typeof input === "string" || (typeof URL !== "undefined" && input instanceof URL)
      ? String(input)
      : (input && input.url);
    var mapped = mapUrl(url || input);
    var headers = detachRsc(input, init);
    if (typeof Request !== "undefined" && input instanceof Request) {
      return origFetch.call(this, new Request(mapped, input), { headers: headers });
    }
    return origFetch.call(this, mapped, Object.assign({}, init || {}, { headers: headers }));
  };
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = mapUrl(url);
    return origOpen.apply(this, args);
  };
  function patchSrc(proto, key){
    var desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || !desc.set) return;
    Object.defineProperty(proto, key, {
      configurable: true,
      get: desc.get,
      set: function(value){ desc.set.call(this, mapUrl(value)); }
    });
  }
  patchSrc(HTMLScriptElement.prototype, "src");
  patchSrc(HTMLLinkElement.prototype, "href");
  patchSrc(HTMLImageElement.prototype, "src");
  patchSrc(HTMLSourceElement.prototype, "src");
  patchSrc(HTMLIFrameElement.prototype, "src");
  patchSrc(HTMLFormElement.prototype, "action");
})();
</script>`;
}

export function rewriteHtml(html: string, destinationUrl: string) {
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
  next = hideOriginsOutsideScripts(next, destinationUrl);
  next = next.replace(
    /<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi,
    "",
  );

  const prerendered = htmlLooksPrerendered(next);
  if (prerendered) {
    next = next.replace(SCRIPT_RE, "");
    if (/<head[^>]*>/i.test(next)) {
      next = next.replace(/<head([^>]*)>/i, `<head$1><base href="${RELAY_PREFIX}/">`);
    }
  } else if (/<head[^>]*>/i.test(next)) {
    next = next.replace(/<head([^>]*)>/i, `<head$1>${relayBootstrap(destinationUrl)}`);
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

export function rewriteHopHeaders(headers: Headers, destinationUrl: string) {
  const link = headers.get("link");
  if (link) {
    headers.set("link", hideDestination(link, destinationUrl));
  }
}

export function normalizeDestinationUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (/^https:\/\//i.test(value)) return value;
  if (/^http:\/\//i.test(value)) return `https://${value.slice("http://".length)}`;
  return `https://${value}`;
}
