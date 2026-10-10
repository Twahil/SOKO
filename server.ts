/** Self-hosted Better Auth for SOKO Tanzania. No Grok authentication dependency. */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { ensureDbReady, getPglite } from "./db";
import { emailAndPasswordEnabled } from "./email-password";
import { pgliteDialect } from "./pglite-dialect";

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const databaseUrl = env("DATABASE_URL");
const globalRef = globalThis as typeof globalThis & { __sokoAuthSecret__?: string };
const secret = env("BETTER_AUTH_SECRET") ?? (globalRef.__sokoAuthSecret__ ??= randomBytes(32).toString("hex"));

const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

void ensureDbReady();

export const authConfigured = true;

export const auth = betterAuth({
  baseURL: env("BETTER_AUTH_URL") ?? "http://localhost:8080",
  secret,
  database,
  trustedOrigins: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    ...(env("BETTER_AUTH_URL") ? [env("BETTER_AUTH_URL") as string] : []),
  ],
  emailAndPassword: {
    enabled: emailAndPasswordEnabled,
    requireEmailVerification: false,
  },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: false, sameSite: "lax", path: "/" },
  },
  plugins: [tanstackStartCookies()],
});

export function readSessionToken(): string | null {
  return null;
}
