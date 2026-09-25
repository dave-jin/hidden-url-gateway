"use client";

import { useEffect, useState } from "react";
import type { AppLocale } from "@/lib/locale";
import { localeFromAcceptLanguage, oncePerEmailCopy } from "@/lib/locale";

export function OncePerEmailBanner({ locale }: { locale: AppLocale }) {
  const [copy, setCopy] = useState(oncePerEmailCopy(locale));

  useEffect(() => {
    const preferred = navigator.languages?.join(",") || navigator.language;
    setCopy(oncePerEmailCopy(localeFromAcceptLanguage(preferred)));
  }, []);

  return (
    <div className="relative z-30 border-b border-gold/15 bg-black/85 px-4 py-2.5 text-center backdrop-blur-md">
      <p className="text-[13px] leading-5 text-gold">{copy}</p>
    </div>
  );
}
