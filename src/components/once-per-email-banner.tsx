"use client";

import { useLocale } from "@/components/use-locale";
import type { AppLocale } from "@/lib/locale";
import { copyFor } from "@/lib/messages";

export function OncePerEmailBanner({ locale }: { locale: AppLocale }) {
  const copy = copyFor(useLocale(locale)).banner;

  return (
    <div className="relative z-30 border-b border-gold/15 bg-black/85 px-4 py-2.5 text-center backdrop-blur-md">
      <p className="text-[13px] leading-5 text-gold">{copy}</p>
    </div>
  );
}
