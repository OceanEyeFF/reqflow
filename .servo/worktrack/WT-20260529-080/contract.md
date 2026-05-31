# Worktrack Contract: WT-20260529-080

## Metadata

- worktrack_id: WT-20260529-080
- title: Prisma PostgreSQL provider 迁移边界
- milestone_id: MS-9
- derived_from_milestone: true
- node_type: migration
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-9`; WT-078 established the hybrid search architecture boundary and WT-079 added a reproducible PostgreSQL service/readiness lane.
- snapshot_freshness: `develop` baseline is `0fd6d19d92fb77032da64c6ed0164386bb7aa783`, with WT-079 merged and MS-9 progress at 2/5.
- milestone_purpose_alignment: directly supports MS-9 completion signal 2 and 3 by making Prisma's provider, migration state, seed/test database strategy, and CI database preparation PostgreSQL-first.
- historical_conflict_risk: high; the current Prisma datasource and migration history are SQLite, API tests create SQLite file databases, and existing docs still describe SQLite local/test behavior.
- worktrack_adjustment_recommendations: include provider, migration lock/history boundary, CI/test helper updates, seed validation, docs, and rollback notes. Keep pgvector, BM25/FTS, `pg_search`, SearchIndexProfile, and retrieval evaluation out of this worktrack.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 0fd6d19d92fb77032da64c6ed0164386bb7aa783
- work_branch: worktrack/wt-20260529-080-prisma-postgres-provider-boundary
- worktree_path: .worktrees/wt-20260529-080-prisma-postgres-provider-boundary

## Scope

### Goal

Switch the Prisma application boundary from SQLite to PostgreSQL with reproducible migration, seed, test, CI, and rollback documentation.

### In Scope

- `prisma/schema.prisma` datasource provider migration to PostgreSQL.
- Prisma migration lock/history update needed for a PostgreSQL baseline.
- CI database preparation so lint/test/build and `postgres:readiness` run against PostgreSQL.
- API test helper migration from per-file SQLite databases to isolated PostgreSQL schemas.
- Seed and readiness validation against PostgreSQL.
- Documentation of local dev/test/CI PostgreSQL flow, SQLite rollback/restore notes, and WT-081 handoff.
- WT-080 control artifacts and gate evidence.

### Out of Scope

- Enabling pgvector.
- Evaluating or enabling `pg_search`, BM25, PostgreSQL FTS, Chinese tokenization, or lexical ranking.
- Adding SearchIndexProfile or embedding provider schema.
- Implementing hybrid retrieval, query understanding, RRF, context building, or debug evidence.
- Production data migration execution or deletion of existing SQLite databases.
- External hosted search services or third-party vector databases.

## Typed Execution Policy

- baseline_form: commit-on-migration-branch
- merge_required: yes
- gate_criteria: schema + migration + validation + rollback notes
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- `prisma/schema.prisma` uses `provider = "postgresql"` and validates with a PostgreSQL `DATABASE_URL`.
- Prisma migration lock/history is PostgreSQL-compatible and `npx prisma migrate status --schema prisma/schema.prisma` passes against PostgreSQL.
- CI baseline uses the PostgreSQL service for Prisma generate, tests, build database preparation, and build.
- API tests use isolated PostgreSQL schemas and clean up those schemas after execution.
- `npm run postgres:readiness` performs PostgreSQL validate and migrate status rather than SQLite fallback.
- `prisma/seed.ts` can run against PostgreSQL after migrations.
- Documentation records local PostgreSQL commands, rollback/restore notes, and the fact that extension readiness remains WT-081.
- No pgvector/BM25/FTS/retrieval feature schema is introduced.

## Verification Requirements

- `node --check scripts/wait-for-postgres.mjs`
- `node --check scripts/postgres-readiness.mjs`
- `git diff --check`
- `npx prisma validate --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`
- `npx prisma migrate status --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`
- `npm run postgres:readiness`
- `npm run db:seed` against PostgreSQL
- `npm run lint`
- `npm run test`
- `npm run build`
- Review changed files for extension/search scope non-change.

## Rollback Conditions

- Existing application schema cannot be represented on PostgreSQL without out-of-scope search/index changes.
- CI/test flow still depends on SQLite file databases after provider migration.
- Migration history cannot be applied to a clean PostgreSQL database.
- Seed data cannot be created on PostgreSQL after migration.
- Existing AI draft or knowledge filtering behavior changes outside the database provider boundary.
