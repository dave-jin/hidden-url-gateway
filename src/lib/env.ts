function readSecret(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function getSessionSecret() {
  return readSecret("SESSION_SECRET", "dev-only-session-secret-change-me");
}

export function getAdminSecret() {
  return readSecret("ADMIN_SECRET", "spacexai");
}

export function isUsingDevSecrets() {
  return !process.env.SESSION_SECRET || !process.env.ADMIN_SECRET;
}
