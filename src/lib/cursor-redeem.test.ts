import assert from "node:assert/strict";
import test from "node:test";
import {
  canContinueClaim,
  continueDestinationUrl,
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

test("continueDestinationUrl only accepts Cursor redeem links", () => {
  assert.equal(
    continueDestinationUrl(
      "https://cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
    ),
    "https://cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
  );
  assert.equal(
    continueDestinationUrl(
      "http://cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
    ),
    "https://cursor.com/redeem/event/grok-bot-meetup-yangon-j25wpk-ag24rf",
  );
  assert.equal(continueDestinationUrl("https://innate.kr"), null);
  assert.equal(canContinueClaim(null), false);
  assert.equal(
    canContinueClaim({
      found: true,
      eventName: "Grok-Bot meetup Yangon",
      creditCents: 3000,
      claimState: "EVENT_CODE_CLAIM_STATE_OPEN",
      claimStartsAtMs: 1,
      claimEndsAtMs: 2,
      creditTtlDays: 30,
      creditDestination: "EVENT_CODE_CREDIT_DESTINATION_USAGE_GRANT",
    }),
    true,
  );
});
