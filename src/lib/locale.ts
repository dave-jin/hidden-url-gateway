export const APP_LOCALES = [
  "ko",
  "en",
  "ja",
  "fr",
  "de",
  "es",
  "zh",
  "pt",
  "it",
  "vi",
  "th",
  "id",
] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

const LOCALE_SET = new Set<string>(APP_LOCALES);

export function localeFromAcceptLanguage(header: string | null | undefined): AppLocale {
  if (!header) return "en";

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qualityPart = params.find((item) => item.trim().startsWith("q="));
      const quality = qualityPart ? Number(qualityPart.trim().slice(2)) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((item) => item.tag)
    .sort((left, right) => right.quality - left.quality);

  for (const { tag } of tags) {
    const base = tag.split("-")[0];
    if (base === "zh") return "zh";
    if (LOCALE_SET.has(base)) return base as AppLocale;
  }

  return "en";
}
