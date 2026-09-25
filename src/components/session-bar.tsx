"use client";

import { useRouter } from "next/navigation";
import { EventMark } from "@/components/event-mark";
import { MakerCredit } from "@/components/maker-credit";
import { useLocale } from "@/components/use-locale";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/locale";
import { copyFor } from "@/lib/messages";
import type { PublicEvent } from "@/lib/types";

export function SessionBar({
  event,
  email,
  locale,
}: {
  event: PublicEvent;
  email: string;
  locale: AppLocale;
}) {
  const router = useRouter();
  const copy = copyFor(useLocale(locale));

  async function leave() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gold/10 bg-black/50 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <EventMark src={event.logoPath} name={event.name} size="sm" />
        <div>
          <p className="text-sm font-medium">{event.name}</p>
          <p className="text-[11px] tracking-[0.16em] text-gold-dim uppercase">
            {copy.secured}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <MakerCredit compact locale={locale} />
        </div>
        <p className="hidden text-xs text-muted-foreground md:block">{email}</p>
        <Button variant="outline" onClick={leave}>
          {copy.leave}
        </Button>
      </div>
    </header>
  );
}
