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

export function claimContinueCopy(locale: AppLocale) {
  if (locale === "ko") {
    return {
      bound: (email: string) =>
        `${email}로 확인된 세션입니다. 목적지 주소는 아래 버튼을 누르기 전까지 브라우저에 나가지 않습니다.`,
      title: "Cursor에서 크레딧 받기",
      body: "크레딧은 Cursor 계정에 붙습니다. 다음 화면에서 Cursor 로그인이 필요합니다.",
      button: "Cursor에 로그인해서 받기",
      closed: "지금은 클레임 기간이 아니라서 이동 버튼을 열지 않았습니다.",
    };
  }
  return {
    bound: (email: string) =>
      `Bound to ${email}. The destination address stays on the server until you continue.`,
    title: "Claim on Cursor",
    body: "Credits are added to a Cursor account. The next screen asks you to sign in to Cursor.",
    button: "Sign in on Cursor to claim",
    closed: "The claim window is not open, so the continue button is hidden.",
  };
}
