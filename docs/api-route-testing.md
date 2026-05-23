# API Route Testing

M3 uses Vitest-based route handler integration tests. The shared helpers live in `src/test/api-test-helpers.ts`.

## Boundaries

- Test databases must use `createTestDatabaseUrl()` and live under `prisma/test-dbs/`.
- Test databases are ignored by Git and must be removed with `removeTestDatabase()` after use.
- Tests must not depend on `prisma/dev.db` state.
- Route handler auth should be controlled by mocking `@/auth` and configuring the mocked `auth()` with `mockAuthSession()`, `mockNoSession()`, or `mockAuthFailure()`.

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
