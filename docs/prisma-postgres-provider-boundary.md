# Prisma PostgreSQL Provider Boundary

## Metadata

- worktrack: WT-20260529-080
- milestone: MS-9
- updated: 2026-05-31

## Decision

ReqFlow now treats PostgreSQL as the Prisma datasource provider.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The versioned Prisma migration history is PostgreSQL-compatible, and CI/test/build database preparation is PostgreSQL-first. Existing local SQLite database files are not deleted by this worktrack and are not treated as migration truth.

## Local PostgreSQL Flow

Start the local PostgreSQL service:

```bash
docker compose -f docker-compose.postgres.yml up -d postgres
```

Use a PostgreSQL URL:

```bash
DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public"
POSTGRES_DATABASE_URL="$DATABASE_URL"
TEST_DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_test"
```

Prepare the database and seed demo data:

```bash
npm run postgres:wait
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:seed
npm run dev
```

## Test Database Isolation

API route tests no longer create SQLite files under `prisma/test-dbs/`. `createTestDatabaseUrl()` now creates an isolated PostgreSQL schema per test file using `TEST_DATABASE_URL` as the database base URL.

For local tests:

```bash
TEST_DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_test"
npm run test
```

Each test helper run creates its schema before `prisma db push` and drops that schema during cleanup. The helper rejects non-PostgreSQL URLs so provider regressions fail closed.

## CI Boundary

The GitHub Actions baseline job now starts PostgreSQL 16, waits for readiness, generates Prisma Client, runs lint and tests, applies migrations with `prisma migrate deploy`, then builds.

The `postgres-readiness` job also deploys migrations before running `npm run postgres:readiness`, which performs:

- `prisma validate`
- `prisma migrate status`

Both jobs use PostgreSQL URLs. The old `DATABASE_URL=file:./ci.db` CI path is retired.

## SQLite Rollback / Restore Notes

WT-080 does not execute production data migration and does not delete local SQLite files. If a developer needs to inspect or restore old local data:

1. Keep the existing SQLite files outside Git (`dev.db`, `prisma/dev.db`, journals, and local backups).
2. Check out a pre-WT-080 commit in a separate worktree.
3. Use the old SQLite-compatible Prisma schema and migrations there.
4. Export or manually inspect the data before creating an explicit PostgreSQL import plan.

Do not copy SQLite files into the PostgreSQL worktree as source of truth. Any production or user-data migration requires a separate approved worktrack.

## WT-081 Handoff

The following remain out of scope for WT-080:

- pgvector extension enablement and index readiness.
- `pg_search`, BM25, PostgreSQL native FTS, Chinese tokenization, and fallback deployability decisions.
- SearchIndexProfile or embedding provider schema.
- Hybrid retrieval implementation, ranking, debug evidence, or evaluation harness.

WT-081 should start from a PostgreSQL-backed Prisma baseline and evaluate extensions without re-opening the provider migration boundary.
