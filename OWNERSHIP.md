# SOKO Tanzania - Ownership Setup

The app no longer requires Grok for authentication. Accounts use Better Auth with email/password on the app's own `/api/auth/*` endpoint.

For production ownership, provide:
- `DATABASE_URL`: your own PostgreSQL database.
- `BETTER_AUTH_URL`: your own public domain.
- `BETTER_AUTH_SECRET`: a secret generated and stored by you.

Orders are stored server-side and are scoped to the signed-in SOKO account. Product catalog is currently in `src/lib/catalog.ts`; payment integration and an admin dashboard are separate next steps.
