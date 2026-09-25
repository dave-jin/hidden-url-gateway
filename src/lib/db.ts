import postgres from "postgres";

let cached: ReturnType<typeof postgres> | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!cached) {
    cached = postgres(url, {
      ssl: "require",
      max: 1,
      prepare: false,
      connect_timeout: 8,
      idle_timeout: 20,
    });
  }
  return cached;
}
