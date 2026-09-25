function readSecret(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const ADMIN_PASSWORD = "spacexaikorea";

export function getSessionSecret() {
  return readSecret("SESSION_SECRET", "dev-only-session-secret-change-me");
}

export function getAdminSecret() {
  return ADMIN_PASSWORD;
}

export function isUsingDevSecrets() {
  return !process.env.SESSION_SECRET;
}
