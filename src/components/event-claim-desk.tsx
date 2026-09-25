import { ClaimContinueButton } from "@/components/claim-continue-button";
import { EventMark } from "@/components/event-mark";
import { MakerCredit } from "@/components/maker-credit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canContinueClaim,
  claimStateLabel,
  formatClaimInstant,
  formatCredit,
  type EventCodeInfo,
} from "@/lib/cursor-redeem";
import type { AppLocale } from "@/lib/locale";
import { claimContinueCopy } from "@/lib/locale";
import type { PublicEvent } from "@/lib/types";

export function EventClaimDesk({
  event,
  email,
  info,
  error,
  locale,
}: {
  event: PublicEvent;
  email: string;
  info: EventCodeInfo | null;
  error?: string;
  locale: AppLocale;
}) {
  const copy = claimContinueCopy(locale);
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <EventMark
          src={event.wordmarkPath}
          name={event.name}
          size="lg"
          variant="wordmark"
        />
        <Badge className="mt-6 border-gold/20 bg-gold/10 text-gold">
          Hidden claim desk
        </Badge>
        <h1 className="sr-only">{event.name}</h1>
        {info?.found ? (
          <>
            <p className="mt-5 display text-3xl sm:text-4xl">{info.eventName}</p>
            <p className="mt-3 text-sm tracking-[0.22em] text-gold uppercase">
              {claimStateLabel(info.claimState, info.claimStartsAtMs)}
            </p>
          </>
        ) : (
          <p className="mt-5 display text-3xl">Event credits</p>
        )}
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {copy.bound(email)}
        </p>
      </div>

      {error ? (
        <Card className="mt-10 border-destructive/30 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] uppercase">
              Could not load the claim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {info && info.found === false ? (
        <Card className="mt-10 border-gold/15 bg-black/35">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This event code was not found. Ask the organizer to check the
              hidden destination.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {info?.found ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card className="border-gold/15 bg-black/35">
            <CardHeader>
              <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
                Event credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="display text-3xl">{formatCredit(info.creditCents)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Added as event usage credit
                {info.creditTtlDays ? ` · ${info.creditTtlDays} days` : ""}.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gold/15 bg-black/35">
            <CardHeader>
              <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
                Claim window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                {formatClaimInstant(info.claimStartsAtMs) || "Open"}
                {info.claimEndsAtMs
                  ? ` → ${formatClaimInstant(info.claimEndsAtMs)}`
                  : ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Times are shown in Korea Standard Time.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {canContinueClaim(info) ? (
        <div className="flex justify-center">
          <ClaimContinueButton locale={locale} />
        </div>
      ) : info?.found ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{copy.closed}</p>
      ) : null}

      <div className="mt-12">
        <MakerCredit />
      </div>
    </div>
  );
}
