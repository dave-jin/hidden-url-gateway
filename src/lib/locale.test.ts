import assert from "node:assert/strict";
import test from "node:test";
import { localeFromAcceptLanguage, oncePerEmailCopy } from "@/lib/locale";

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
