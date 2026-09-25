"use client";

import { EventMark } from "@/components/event-mark";
import { MakerCredit } from "@/components/maker-credit";
import { useLocale } from "@/components/use-locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppLocale } from "@/lib/locale";
import { copyFor } from "@/lib/messages";
import type { PublicEvent } from "@/lib/types";

export function CreditsVault({
  event,
  email,
  locale = "en",
  pass,
}: {
  event: PublicEvent;
  email: string;
  locale?: AppLocale;
  pass: string;
}) {
  const active = useLocale(locale);
  const copy = copyFor(active);
  const code = pass;

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
          {copy.accessConfirmed}
        </Badge>
        <h1 className="sr-only">{event.name}</h1>
        <p className="mt-2 text-sm tracking-[0.28em] text-gold uppercase">
          {event.tagline}
        </p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {copy.vaultBound(email)}
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
              {copy.allocation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="display text-3xl">$50</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.allocationBody}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
              {copy.claimCode}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground">{code}</p>
            {copy.claimCodeNote ? (
              <p className="mt-2 text-sm text-muted-foreground">{copy.claimCodeNote}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <div className="mt-12">
        <MakerCredit locale={active} />
      </div>
    </div>
  );
}
