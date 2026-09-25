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
    <form action="/api/redeem/continue" method="post" className="mt-8 w-full text-center">
      <p className="font-mono text-[11px] tracking-[0.16em] text-white/35">{pass}</p>
      <p className="mt-1 text-[11px] text-white/30">{copy.passNote}</p>
      <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">{copy.claimBody}</p>
      <Button type="submit" className="mt-5 h-12 w-full rounded-xl text-sm">
        {copy.claimButton}
      </Button>
    </form>
  );
}
