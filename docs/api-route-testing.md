# API Route Testing

M3 uses Vitest-based route handler integration tests. The shared helpers live in `src/test/api-test-helpers.ts`.

## Boundaries

- Test databases must use `createTestDatabaseUrl()`, which creates an isolated PostgreSQL schema from `TEST_DATABASE_URL`.
- Test databases are ignored by Git and must be removed with `removeTestDatabase()` after use.
- Tests must not depend on `prisma/dev.db` state.
- Route handler auth should be controlled by mocking `@/auth` and configuring the mocked `auth()` with `mockAuthSession()`, `mockNoSession()`, or `mockAuthFailure()`.
- Attachment tests must track any files they create under `public/uploads/` and remove them during cleanup.

## Recommended Pattern

1. Create a test database URL with `createTestDatabaseUrl()`.
2. Set `process.env.DATABASE_URL` before importing route modules that use Prisma.
3. Push the Prisma schema with `pushTestDatabaseSchema()`.
4. Mock `@/auth` before importing route modules so both direct `auth()` users and `requireAuth()` users share the same auth boundary.
5. Import the route handler after mocks and environment are configured.
6. Use `getRequest()`, `jsonRequest()`, `routeParams()`, and `readJson()` for route calls.
7. Use `clearDatabase()` between cases when sharing one Prisma client.
8. Disconnect Prisma and remove the test database during cleanup.

## Gate

Each API route worktrack should pass:

- `npm run test`
- `npm run lint`
- `npm run build`

Each route test slice should include at least one successful path, one unauthenticated path, one invalid-input path, and one not-found or authorization path when applicable.

## M3 Coverage

| Area | Test Files | Coverage Notes |
|------|------------|----------------|
| Shared fixtures | `src/test/api-test-helpers.test.ts` | PostgreSQL schema URL generation, auth mocks, request helpers, JSON response reading |
| Tickets | `src/app/api/tickets/route.test.ts`, `src/app/api/tickets/[id]/route.test.ts` | list/create/stats, detail/update/delete, auth failure, validation, 404, admin authorization |
| Comments | `src/app/api/tickets/[id]/comments/route.test.ts` | auth failure, ordered list, empty content, create, participant notifications |
| Members | `src/app/api/tickets/[id]/members/route.test.ts` | list, missing input, permission denial, add, missing delete, role update, log and notification side effects |
| Logs | `src/app/api/tickets/[id]/logs/route.test.ts` | auth failure and newest-first log ordering |
| Attachments | `src/app/api/tickets/[id]/attachments/route.test.ts` | auth failure, missing ticket, missing file, upload metadata/file write, forbidden delete, owner delete and file cleanup |
| Notifications | `src/app/api/notifications/route.test.ts` | auth failure, unread filtering, batch mark-read scope, single mark-read ownership, read-all scope |

Current verified M3 baseline:

- `npm run lint` passes with 0 warnings.
- `npm run test` passes with 10 test files and 71 tests.
- `npm run build` passes on Next.js 16.2.6.
