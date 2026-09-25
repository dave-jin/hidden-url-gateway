import type { AppLocale } from "@/lib/locale";

export type GateErrorCode = "rate_limited" | "invalid_email" | "not_invited" | "unavailable";

export function copyFor(locale: AppLocale) {
  return locale;
}
