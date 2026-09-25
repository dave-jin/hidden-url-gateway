"use client";

import { useEffect, useState } from "react";
import type { AppLocale } from "@/lib/locale";
import { localeFromAcceptLanguage } from "@/lib/locale";

export function useLocale(initial: AppLocale) {
  const [locale, setLocale] = useState(initial);

  useEffect(() => {
    const preferred = navigator.languages?.join(",") || navigator.language;
    setLocale(localeFromAcceptLanguage(preferred));
  }, []);

  return locale;
}
