# Gate Evidence: WT-20260529-080

## Metadata

- worktrack_id: WT-20260529-080
- title: Prisma PostgreSQL provider 迁移边界
- milestone_id: MS-9
- node_type: migration
- status: pass
- created_at: 2026-05-31
- carrier_decision: current-carrier with explorer sidecar

## Implementation Evidence

- Changed `prisma/schema.prisma` datasource provider from SQLite to PostgreSQL.
- Changed `prisma/migrations/migration_lock.toml` provider to PostgreSQL.
- Updated existing migration SQL from SQLite date/table-rebuild syntax to PostgreSQL-compatible SQL.
- Updated CI baseline to run with a PostgreSQL 16 service and PostgreSQL `DATABASE_URL`.
- Updated `postgres-readiness` CI job to deploy migrations before readiness checks.
- Changed API test helper isolation from SQLite files to isolated PostgreSQL schemas.
- Made `scripts/postgres-readiness.mjs` fail closed unless Prisma provider is PostgreSQL.
- Added `docs/prisma-postgres-provider-boundary.md`.
- Updated README and current DB/testing/readiness docs for PostgreSQL.

## Boundary Evidence

- No pgvector extension was enabled.
- No `pg_search`, BM25, PostgreSQL FTS, Chinese tokenizer, SearchIndexProfile, embedding provider, or hybrid retrieval schema was added.
- No production data migration was executed.
- Existing SQLite data files were not deleted.
- AI draft behavior and knowledge filtering behavior were not changed.

## Validation Evidence

- `docker compose -f docker-compose.postgres.yml up -d postgres`: pass after starting Docker Desktop.
- `npm run postgres:wait`: pass.
- `node --check scripts/wait-for-postgres.mjs`: pass.
- `node --check scripts/postgres-readiness.mjs`: pass.
- `git diff --check`: pass.
- `npx prisma validate --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`: pass.
- `npx prisma generate`: pass.
- `npx prisma migrate deploy --schema prisma/schema.prisma` against PostgreSQL `public` schema: pass, 7 migrations applied.
- `npx prisma migrate status --schema prisma/schema.prisma` against PostgreSQL `public` schema: pass, database schema up to date.
- `npm run postgres:readiness`: pass, PostgreSQL validate + migrate status.
- `npx prisma migrate deploy --schema prisma/schema.prisma` against PostgreSQL `seed_check` schema: pass.
- `npm run db:seed` against PostgreSQL `seed_check` schema: pass.
- `npm run lint`: pass.
- `npx vitest run src/test/api-test-helpers.test.ts`: pass, 1 file / 5 tests.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL`: pass, 28 files / 201 tests.
- `npm run build` with PostgreSQL `DATABASE_URL`: pass with existing Next.js multi-lockfile worktree warning only.
- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`: generated PostgreSQL SQL for the full datamodel.

## Review Evidence

- Explorer sidecar completed a read-only SQLite binding audit and identified provider, migration lock/history, test helper, CI baseline, and readiness script binding points.
- Post-implementation search found the only remaining `file:./ci.db`, `test-dbs`, and SQLite references in current edited docs are historical/rollback statements, not active code paths.
- Current code paths show `provider = "postgresql"` in `prisma/schema.prisma` and migration lock.

## Gate Verdict

- implementation-gate: pass
- migration-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass

## Residual Risks

- The local validation used Docker Desktop and the WT-079 PostgreSQL compose service; remote GitHub Actions execution is not observed in this local run.
- Production SQLite-to-PostgreSQL data migration remains explicitly out of scope and requires a separate approved plan before any real user data migration.
- PostgreSQL extension readiness for pgvector/BM25/FTS remains WT-20260529-081.
