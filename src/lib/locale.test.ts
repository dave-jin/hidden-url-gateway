import assert from "node:assert/strict";
import test from "node:test";
import {
  claimContinueCopy,
  localeFromAcceptLanguage,
  oncePerEmailCopy,
} from "@/lib/locale";

test("localeFromAcceptLanguage prefers Korean when it ranks first", () => {
  assert.equal(localeFromAcceptLanguage("ko-KR,ko;q=0.9,en-US;q=0.8"), "ko");
  assert.equal(localeFromAcceptLanguage("ko"), "ko");
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage("ja-JP,ja;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage(""), "en");
  assert.equal(localeFromAcceptLanguage(null), "en");
});

test("oncePerEmailCopy follows the preferred language", () => {
  assert.equal(oncePerEmailCopy("ko"), "이메일 당 1회만 등록 가능합니다.");
  assert.equal(oncePerEmailCopy("en"), "Each email can be registered only once.");
});

test("claimContinueCopy keeps the Cursor URL off the button", () => {
  for (const locale of ["ko", "en"] as const) {
    const copy = claimContinueCopy(locale);
    const text = [copy.title, copy.body, copy.button, copy.closed, copy.bound("a@b.c")].join(" ");
    assert.equal(text.includes("cursor.com"), false);
  }
  assert.equal(claimContinueCopy("ko").button.includes("Cursor"), true);
});
