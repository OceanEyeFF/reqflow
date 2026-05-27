# Gate Evidence: WT-20260527-045

## Metadata

- worktrack_id: WT-20260527-045
- status: collecting
- updated: 2026-05-27

## Review Evidence

- Implemented SQLite-compatible `AiProviderConfig` Prisma model and migration.
- Added shared admin guard in `src/lib/admin-auth.ts`.
- Added server-side provider config service in `src/lib/ai/provider-config.ts`.
- Added admin-only API routes:
  - `GET/PUT /api/admin/ai-provider`
  - `POST /api/admin/ai-provider/test`
- Updated AI draft route to resolve effective provider config before creating the provider.
- Updated Deepseek-compatible provider to support explicit localhost no-key mode without sending an Authorization header.
- Added admin-only UI page at `/admin/ai-provider` with server-side admin guard plus client form.
- Added dashboard nav entry visible only to admin users.

## Validation Evidence

- `git diff --check` passed on 2026-05-27.
- `npm run lint` passed with ESLint 0 warnings.
- `npm run test` passed: 17 test files, 112 tests.
- `npm run build` passed with Next.js 16.2.6/Turbopack. Build emitted a workspace-root warning because this worktree has its own `package-lock.json`; compilation and TypeScript succeeded.

## Policy Evidence

- Admin API returns `401` unauthenticated and `403` for authenticated non-admin users.
- API config responses return `hasApiKey` and `maskedApiKey`; tests assert plaintext key is not returned.
- Localhost no-key mode is restricted to localhost/127.0.0.1/[::1] endpoints.
- Cloud/non-local provider config requires an API key.
- No `NEXT_PUBLIC` provider secret exposure was introduced; targeted search found only server-side fields, docs, and tests.
- Provider test route returns endpoint/model/key mode only; it does not return plaintext API keys.

## Gate Verdict

- verdict: pass
- blockers: []
