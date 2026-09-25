import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCredit,
  parseCursorRedeemCode,
} from "@/lib/cursor-redeem";

test("parseCursorRedeemCode reads the event slug and ignores other hosts", () => {
  assert.equal(
    parseCursorRedeemCode(
      "https://cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
    ),
    "grok-bot-meetup-yangon-j25wpk-ag24rf",
  );
  assert.equal(
    parseCursorRedeemCode(
      "http://www.cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
    ),
    "grok-bot-meetup-yangon-j25wpk-ag24rf",
  );
  assert.equal(parseCursorRedeemCode("https://innate.kr/about"), null);
  assert.equal(parseCursorRedeemCode("https://cursor.com/pricing"), null);
});

test("formatCredit turns Cursor cents into a dollar amount", () => {
  assert.equal(formatCredit(3000), "$30");
  assert.equal(formatCredit(1550), "$15.50");
});
