import assert from "node:assert/strict";
import test from "node:test";
import { isAllowlisted, parseEmailList } from "@/lib/emails";
import { rewriteHtml, toRelayPath } from "@/lib/proxy";

test("parseEmailList accepts csv and paste", () => {
  const emails = parseEmailList("Demo@SpaceXAI.com, grok@x.ai\nbad\nnot-an-email");
  assert.deepEqual(emails, ["demo@spacexai.com", "grok@x.ai"]);
});

test("allowlist is case-insensitive", () => {
  assert.equal(isAllowlisted("GROK@x.ai", ["grok@x.ai"]), true);
  assert.equal(isAllowlisted("other@x.ai", ["grok@x.ai"]), false);
});

test("proxy rewrite hides destination origin", () => {
  const dest = "https://secret.example/credits?token=abc";
  const html = rewriteHtml(
    `<a href="https://secret.example/credits?token=abc">open</a><img src="/logo.png">`,
    dest,
  );
  assert.equal(html.includes("secret.example"), false);
  assert.equal(html.includes("/api/relay"), true);
  const mapped = toRelayPath(
    new URL(dest),
    new URL("https://secret.example/assets/app.css"),
  );
  assert.equal(mapped?.startsWith("/api/relay/sub?p="), true);
});
