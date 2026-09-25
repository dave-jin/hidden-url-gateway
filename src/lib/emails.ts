const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase().replace(/^["']+|["']+$/g, "");
}

export function isValidEmail(value: string) {
  return EMAIL_RE.test(normalizeEmail(value));
}

export function parseEmailList(input: string) {
  const chunks = input.split(/[\n\r,;\t]+/g);
  const emails = new Set<string>();

  for (const chunk of chunks) {
    const email = normalizeEmail(chunk);
    if (isValidEmail(email)) {
      emails.add(email);
    }
  }

  return [...emails].sort();
}

export function isAllowlisted(email: string, list: string[]) {
  const needle = normalizeEmail(email);
  return list.some((item) => normalizeEmail(item) === needle);
}
