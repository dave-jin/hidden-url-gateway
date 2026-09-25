export type AppLocale = "ko" | "en";

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
    if (tag === "ko" || tag.startsWith("ko-")) return "ko";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return "en";
}

export function oncePerEmailCopy(locale: AppLocale) {
  if (locale === "ko") {
    return "이메일 당 1회만 등록 가능합니다.";
  }
  return "Each email can be registered only once.";
}
