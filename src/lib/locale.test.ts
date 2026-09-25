import assert from "node:assert/strict";
import test from "node:test";
import { APP_LOCALES, localeFromAcceptLanguage } from "@/lib/locale";
import { copyFor } from "@/lib/messages";

test("localeFromAcceptLanguage follows the browser preference list", () => {
  assert.equal(localeFromAcceptLanguage("ko-KR,ko;q=0.9,en-US;q=0.8"), "ko");
  assert.equal(localeFromAcceptLanguage("ja-JP,ja;q=0.9,en;q=0.8"), "ja");
  assert.equal(localeFromAcceptLanguage("fr-FR,fr;q=0.9"), "fr");
  assert.equal(localeFromAcceptLanguage("de-DE"), "de");
  assert.equal(localeFromAcceptLanguage("zh-TW,zh;q=0.9"), "zh");
  assert.equal(localeFromAcceptLanguage("pt-BR,pt;q=0.8"), "pt");
  assert.equal(localeFromAcceptLanguage("vi-VN"), "vi");
  assert.equal(localeFromAcceptLanguage("th-TH"), "th");
  assert.equal(localeFromAcceptLanguage("id-ID"), "id");
  assert.equal(localeFromAcceptLanguage("it-IT"), "it");
  assert.equal(localeFromAcceptLanguage("es-MX"), "es");
  assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage("sv-SE,sv;q=0.9"), "en");
  assert.equal(localeFromAcceptLanguage(""), "en");
  assert.equal(localeFromAcceptLanguage(null), "en");
});

test("every supported language has visitor copy without a public redeem host", () => {
  assert.ok(APP_LOCALES.length >= 10);
  for (const locale of APP_LOCALES) {
    const copy = copyFor(locale);
    const text = [
      copy.banner,
      copy.gateFoot,
      copy.passFor("a@b.c"),
      copy.doNotShare,
      copy.claimButton,
      copy.myClaim,
    ].join(" ");
    assert.equal(text.includes("cursor.com"), false, locale);
    assert.ok(copy.banner.length > 0, locale);
    assert.ok(copy.claimButton.length > 0, locale);
  }
});
