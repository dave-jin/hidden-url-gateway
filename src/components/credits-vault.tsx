import { EventMark } from "@/components/event-mark";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claimCodeFor } from "@/lib/claim-code";
import type { PublicEvent } from "@/lib/types";

export function CreditsVault({
  event,
  email,
}: {
  event: PublicEvent;
  email: string;
}) {
  const code = claimCodeFor(email);

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
          Access confirmed
        </Badge>
        <h1 className="sr-only">{event.name}</h1>
        <p className="mt-2 text-sm tracking-[0.28em] text-gold uppercase">
          {event.tagline}
        </p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          This desk is bound to {email}. The credit page lives inside this
          session. There is no public URL to copy.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
              Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="display text-3xl">$50</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Event credit for Grok Bot inference during the session window.
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] text-gold-dim uppercase">
              Claim code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg tracking-[0.12em]">{code}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Generated for this invited email. It is not a destination link.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
