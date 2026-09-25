import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/locale";
import { claimContinueCopy } from "@/lib/locale";

export function ClaimContinueButton({ locale }: { locale: AppLocale }) {
  const copy = claimContinueCopy(locale);

  return (
    <form action="/api/redeem/continue" method="post" className="mt-10 w-full max-w-md">
      <div className="rounded-2xl border border-gold/15 bg-black/35 p-6 text-center">
        <p className="text-sm tracking-[0.16em] text-gold-dim uppercase">{copy.title}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.body}</p>
        <Button
          type="submit"
          className="mt-5 h-12 w-full rounded-xl text-sm tracking-[0.12em]"
        >
          {copy.button}
        </Button>
      </div>
    </form>
  );
}
