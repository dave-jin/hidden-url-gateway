export function hasSupabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}
