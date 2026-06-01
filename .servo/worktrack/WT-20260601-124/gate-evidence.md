# Gate Evidence: WT-20260601-124

## Metadata

- worktrack_id: WT-20260601-124
- milestone_id: MS-15
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Updated `docker-compose.paradedb.yml` so the PostgreSQL 18 based ParadeDB image mounts the candidate database volume at `/var/lib/postgresql`.
- Renamed the candidate database volume to `reqflow-paradedb-postgres18-data`; the older pre-smoke candidate volume name is not reused or deleted.
- Updated `docs/ms15-paradedb-runtime-design.md` with the PostgreSQL 18 mount-path requirement and the superseded volume-name boundary.
- Updated `scripts/postgres-readiness.mjs` to call `npx prisma` instead of the private `node_modules/prisma/build/index.js` path.
- Updated `src/test/api-test-helpers.ts` to call `npx prisma` for test schema push/execute for the same worktree-safe Prisma CLI reason.
- Did not modify `docker-compose.runtime.yml`.
- Did not enable ParadeDB as the default runtime.
- Did not delete volumes, uploads, model cache, or database state.
- Explorer sidecar performed read-only script/env review and reported no file changes.

## Candidate Compose Evidence

- `docker compose -f docker-compose.paradedb.yml config`: pass.
- Resolved image: `paradedb/paradedb@sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d`.
- Resolved platform: `linux/amd64`.
- Resolved PostgreSQL host port: `55437`.
- Resolved web host port: `3307`.
- Resolved candidate database volume: `wt-20260601-124-paradedb-prisma-smoke_reqflow-paradedb-postgres18-data`.
- Resolved candidate upload volume: `wt-20260601-124-paradedb-prisma-smoke_reqflow-paradedb-uploads`.

## Runtime Startup Evidence

- First `docker compose ... up -d --build postgres web` attempt built the web image but PostgreSQL exited before becoming healthy.
- Root cause: the ParadeDB image is PostgreSQL 18 based and rejects a database volume mounted at `/var/lib/postgresql/data`, reporting an unused-mount/upgrade-layout error.
- Fix: mount the candidate database volume at `/var/lib/postgresql` and use a new candidate volume name.
- Retest `docker compose -f docker-compose.paradedb.yml up -d --force-recreate --build postgres web`: pass.
- PostgreSQL service became healthy.
- Web service started and exposed port `3307`.
- Services were stopped with `docker compose -f docker-compose.paradedb.yml stop web postgres`.

## Prisma, Seed, and Web Smoke Evidence

- First `npm run runtime:smoke` with `RUNTIME_POSTGRES_PORT=55437`, `RUNTIME_WEB_URL=http://127.0.0.1:3307/login`, and `RUNTIME_RUN_SEED=true`:
  - PostgreSQL TCP wait: pass.
  - `prisma migrate deploy`: pass; all 9 migrations applied.
  - `npm run db:seed`: pass; seeded admin/manager/user and sample ticket/comment.
  - `postgres:readiness`: initially failed because the worktree dependency layout did not contain `node_modules/prisma/build/index.js`.
- After replacing the private Prisma CLI path with `npx prisma`, rerun `npm run runtime:smoke` with seed disabled to avoid duplicate sample rows:
  - PostgreSQL TCP wait: pass.
  - `prisma migrate deploy`: pass; no pending migrations.
  - `postgres:readiness`: pass.
  - `search:extensions`: pass.
  - Web HTTP smoke at `http://127.0.0.1:3307/login`: status `200`.
  - Optional embedding sidecar probe: skipped; no embedding service is part of the ParadeDB candidate compose.

## Extension and Version Evidence

- `SEARCH_REQUIRE_PG_SEARCH=true npm run search:extensions`: pass.
- PostgreSQL server_version: `18.4 (Debian 18.4-1.pgdg13+1)`.
- `pg_available_extensions` for target candidates:
  - `pg_search`: default_version `0.23.5`, installed_version `0.23.5`.
  - `vector`: default_version `0.8.1`, installed_version `0.8.1`.
- `pg_extension` installed versions:
  - `pg_search`: `0.23.5`.
  - `vector`: `0.8.1`.
- `pg_am` access methods:
  - `bm25`.
  - `hnsw`.
- `pgvector readiness`: pass.
- Native PostgreSQL FTS readiness: pass.
- `pg_search readiness`: available (`0.23.5`).

## General Validation Evidence

- `npm ci`: pass in the WT-124 worktree; Windows cleanup warning for an old nested directory did not block install.
- `node --check scripts/postgres-readiness.mjs`: pass.
- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass with Next.js 16.2.6 Turbopack after worktree-local dependencies were installed.
- `git diff --check`: pass.
- Targeted policy scan: pass; matches are explicit safety/non-claim documentation, not destructive commands or false default-runtime claims.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-124-paradedb-prisma-smoke`.
- Candidate volumes are separate from the MS-13 default runtime volumes.
- The superseded pre-smoke candidate DB volume was left in place and not deleted.
- Stopping used `docker compose stop`, not `down -v`, `volume rm`, or prune.
- Default runtime remains `docker-compose.runtime.yml`.
- ParadeDB `pg_search` remains candidate runtime evidence only; no default runtime switch was made.

## Gate Verdict

- implementation-gate: pass
- runtime-smoke-gate: pass
- readiness-gate: pass
- regression-gate: pass
- policy-gate: pass
- final: pass
