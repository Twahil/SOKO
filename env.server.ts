/** Server environment helpers for SOKO Tanzania. */
export function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function isProductionDatabaseConfigured(): boolean {
  return Boolean(env("DATABASE_URL"));
}

export function isWorkspacePreview(): boolean {
  return false;
}
