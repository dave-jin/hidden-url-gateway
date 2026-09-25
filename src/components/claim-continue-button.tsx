"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/use-locale";
import type { AppLocale } from "@/lib/locale";
import { copyFor } from "@/lib/messages";

export function ClaimContinueButton({
  locale,
  pass,
}: {
  locale: AppLocale;
  pass: string;
}) {
  const copy = copyFor(useLocale(locale));

  return (
    <form action="/api/redeem/continue" method="post" className="mt-8 w-full">
      <div className="rounded-2xl border border-gold/25 bg-black/45 p-6 text-center">
        <p className="text-[11px] tracking-[0.28em] text-gold-dim uppercase">{copy.passNote}</p>
        <p className="mt-3 font-mono text-2xl tracking-[0.18em] text-gold">{pass}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{copy.claimBody}</p>
        <p className="mt-3 text-sm leading-6 text-foreground">{copy.doNotShare}</p>
        <Button
          type="submit"
          className="mt-5 h-12 w-full rounded-xl text-sm tracking-[0.08em]"
        >
          {copy.claimButton}
        </Button>
      </div>
    </form>
  );
}
