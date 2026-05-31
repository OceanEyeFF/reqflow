# Gate Evidence: WT-20260529-079

## Metadata

- worktrack_id: WT-20260529-079
- title: PostgreSQL dev/test/CI 数据库基线
- milestone_id: MS-9
- node_type: migration
- status: pass
- created_at: 2026-05-31
- carrier_decision: current-carrier

## Implementation Evidence

- Added `docker-compose.postgres.yml` with a PostgreSQL 16 service and healthcheck.
- Added `scripts/wait-for-postgres.mjs` for TCP readiness.
- Added `scripts/postgres-readiness.mjs` as a provider-aware readiness boundary.
- Added `postgres:wait` and `postgres:readiness` scripts to `package.json`.
- Added GitHub Actions `postgres-readiness` job with a PostgreSQL service.
- Added `docs/postgres-dev-test-ci-baseline.md`.
- Existing SQLite lint/test/build CI baseline remains in place.

## Boundary Evidence

- `prisma/schema.prisma` provider remains `sqlite`.
- No Prisma schema or migration file was changed.
- No package dependency was added.
- PostgreSQL Prisma validate/migrate gates remain deferred to WT-20260529-080.
- `postgres:readiness` detects the current datasource provider. Before WT-080, it validates the current provider with a SQLite-compatible CI URL; after WT-080 changes provider to PostgreSQL, it runs PostgreSQL `prisma validate` and `prisma migrate status`.

## Validation Evidence

- `node --check scripts/wait-for-postgres.mjs`: pass.
- `node --check scripts/postgres-readiness.mjs`: pass.
- `git diff --check`: pass.
- `npx prisma generate`: pass after rerun; first parallel attempt hit a Windows file-lock `EPERM` while generating Prisma client.
- `npm run postgres:readiness` with `POSTGRES_DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public`: pass on current SQLite provider boundary.
- `npm run lint`: pass.
- `npm run test`: pass, 28 files / 201 tests.
- `npm run build`: pass with existing multi-lockfile worktree warning only.

## Policy Evidence

- Worktree discipline followed: work executed in `.worktrees/wt-20260529-079-postgres-dev-test-ci-baseline` on branch `worktrack/wt-20260529-079-postgres-dev-test-ci-baseline`.
- No destructive operations performed.
- No production PostgreSQL migration or SQLite data deletion performed.
- No pgvector, BM25/FTS, or `pg_search` extension enabled.
- No AI draft behavior changed.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass

## Residual Risks

- Full PostgreSQL Prisma `validate` and `migrate status` cannot be expected to pass until WT-080 changes the Prisma provider and migration boundary.
- GitHub Actions service behavior is not remotely verified in this local run.
- Local Docker PostgreSQL endpoint was not started by this worktree; `postgres:wait` behavior is covered by script syntax and CI service wiring.
