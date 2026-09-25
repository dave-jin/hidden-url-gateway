"use client";

import { ClaimContinueButton } from "@/components/claim-continue-button";
import { EventMark } from "@/components/event-mark";
import { MakerCredit } from "@/components/maker-credit";
import { useLocale } from "@/components/use-locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canContinueClaim,
  formatClaimInstant,
  formatCredit,
  type EventClaimState,
  type EventCodeInfo,
} from "@/lib/cursor-redeem";
import type { AppLocale } from "@/lib/locale";
import { copyFor } from "@/lib/messages";
import type { PublicEvent } from "@/lib/types";

function stateLine(locale: AppLocale, state: EventClaimState, startsAtMs: number) {
  const copy = copyFor(locale);
  switch (state) {
    case "EVENT_CODE_CLAIM_STATE_UPCOMING":
      return startsAtMs ? copy.stateUpcoming(formatClaimInstant(startsAtMs)) : copy.stateSoon;
    case "EVENT_CODE_CLAIM_STATE_OPEN":
      return copy.stateOpen;
    case "EVENT_CODE_CLAIM_STATE_FULL":
      return copy.stateFull;
    case "EVENT_CODE_CLAIM_STATE_CLOSED":
      return copy.stateClosed;
    case "EVENT_CODE_CLAIM_STATE_DISABLED":
      return copy.stateDisabled;
  }
}

export function EventClaimDesk({
  event,
  email,
  info,
  error,
  locale,
  pass,
}: {
  event: PublicEvent;
  email: string;
  info: EventCodeInfo | null;
  error?: string;
  locale: AppLocale;
  pass: string;
}) {
  const active = useLocale(locale);
  const copy = copyFor(active);
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <EventMark
          src={event.wordmarkPath}
          name={event.name}
          size="lg"
          variant="wordmark"
        />
        <Badge className="mt-6 border-gold/20 bg-gold/10 text-gold">{copy.personalPass}</Badge>
        <h1 className="sr-only">{event.name}</h1>
        {info?.found ? (
          <>
            <p className="mt-5 display text-3xl sm:text-4xl">{info.eventName}</p>
            <p className="mt-3 text-sm tracking-[0.18em] text-gold uppercase">
              {stateLine(active, info.claimState, info.claimStartsAtMs)}
            </p>
          </>
        ) : (
          <p className="mt-5 display text-3xl">{copy.eventCredits}</p>
        )}
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{copy.passFor(email)}</p>
      </div>

      {error ? (
        <Card className="mt-10 border-destructive/30 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] uppercase">{copy.loadError}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {info && info.found === false ? (
        <Card className="mt-10 border-gold/15 bg-black/35">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{copy.notFound}</p>
          </CardContent>
        </Card>
      ) : null}

      {info?.found ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card className="border-gold/15 bg-black/35">
            <CardHeader>
              <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
                {copy.eventCredits}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="display text-3xl">{formatCredit(info.creditCents)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{copy.creditDetail(info.creditTtlDays)}</p>
            </CardContent>
          </Card>
          <Card className="border-gold/15 bg-black/35">
            <CardHeader>
              <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
                {copy.claimWindow}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                {formatClaimInstant(info.claimStartsAtMs) || copy.open}
                {info.claimEndsAtMs ? ` → ${formatClaimInstant(info.claimEndsAtMs)}` : ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{copy.timesKst}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {canContinueClaim(info) ? (
        <ClaimContinueButton locale={active} pass={pass} />
      ) : info?.found ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{copy.closed}</p>
      ) : null}

      <div className="mt-12">
        <MakerCredit locale={active} />
      </div>
    </div>
  );
}
