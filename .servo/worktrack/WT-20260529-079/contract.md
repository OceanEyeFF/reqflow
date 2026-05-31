# Worktrack Contract: WT-20260529-079

## Metadata

- worktrack_id: WT-20260529-079
- title: PostgreSQL dev/test/CI 数据库基线
- milestone_id: MS-9
- derived_from_milestone: true
- node_type: migration
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-9`; baseline branch `develop`; WT-078 completed the hybrid search ADR and identifies WT-079 as the PostgreSQL service/readiness baseline before provider migration.
- snapshot_freshness: current control state, milestone artifact, and worktrack backlog show WT-079 as the next planned worktrack after WT-078. The code baseline is newer than stored observed checkpoint and must be refreshed during closeout.
- milestone_purpose_alignment: directly supports MS-9 completion signal 2 and acceptance criterion 2 by making PostgreSQL dev/test/CI availability reproducible before Prisma provider migration.
- historical_conflict_risk: medium; current app schema and CI still use SQLite. This worktrack must not silently convert Prisma provider or break existing lint/test/build.
- worktrack_adjustment_recommendations: keep scope to PostgreSQL service/readiness scripts, CI service lane, and docs. Leave provider migration to WT-080.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 5699e2cfd9a5d0a074c4c6e1e394c18b18c9de77
- work_branch: worktrack/wt-20260529-079-postgres-dev-test-ci-baseline
- worktree_path: .worktrees/wt-20260529-079-postgres-dev-test-ci-baseline

## Scope

### Goal

Establish a reproducible PostgreSQL dev/test/CI service readiness baseline without changing the current Prisma provider.

### In Scope

- PostgreSQL docker compose service for local development.
- PostgreSQL wait/readiness scripts.
- CI PostgreSQL service readiness job.
- Documentation of current SQLite boundary and WT-080 handoff.
- WT-079 control artifacts and gate evidence.

### Out of Scope

- Changing `prisma/schema.prisma` provider.
- Rewriting or adding Prisma migrations.
- Making application tests run on PostgreSQL.
- Enabling pgvector, BM25/FTS, or `pg_search`.
- Running production data migration or deleting SQLite data.

## Typed Execution Policy

- baseline_form: commit-on-migration-branch
- merge_required: yes
- gate_criteria: schema + migration + validation + rollback notes
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Local PostgreSQL service can be started with a tracked compose file.
- `npm run postgres:wait` verifies PostgreSQL TCP readiness.
- `npm run postgres:readiness` validates PostgreSQL URL handling and documents migrate-status boundary.
- CI has a PostgreSQL service readiness lane that does not break the existing SQLite lint/test/build baseline.
- Documentation clearly states that Prisma provider migration remains WT-080.
- No Prisma schema, migration, package dependency, or application behavior change is introduced.

## Verification Requirements

- `git diff --check`
- `npm run postgres:wait` where a PostgreSQL endpoint is available, or static validation with documented not-run reason.
- `npm run lint`
- `npm run test`
- `npm run build`
- Review changed files for provider/schema/migration non-change.

## Rollback Conditions

- Existing CI baseline job no longer runs lint/test/build.
- Prisma provider or migration history is changed in WT-079.
- Readiness scripts require production credentials.
- PostgreSQL readiness lane hides an unexpected failure as success after WT-080 changes provider migration expectations.
