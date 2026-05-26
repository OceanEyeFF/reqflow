# Worktrack Contract: WT-20260526-028

## Metadata

- worktrack_id: WT-20260526-028
- title: 上云前环境与部署边界文档
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-001`; baseline branch `develop`; GitHub CI workflow exists and remote run `26462219177` passed; PostgreSQL/pgvector and AI implementation remain out of MS5 scope.
- snapshot_freshness: Repo Snapshot/Status and RepoScope Analysis identify WT-20260526-028 as next and require documentation of `.env`, `AUTH_SECRET`, `DATABASE_URL`, uploads, SQLite production risk, and deployment platform boundaries.
- milestone_purpose_alignment: directly supports MS5 completion signal 4 and acceptance criterion 4.
- historical_conflict_risk: medium; documentation must not choose a paid hosting platform, configure production secrets, migrate databases, or imply SQLite is production-safe.
- worktrack_adjustment_recommendations: keep scope to cloud-readiness boundary documentation plus nearest entrypoint links.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: ac18d4a3c27be64dc99b964e05973d6a2692a532
- work_branch: worktrack/wt-20260526-028-cloud-boundary-docs
- worktree_path: .worktrees/wt-20260526-028-cloud-boundary-docs

## Scope

### Goal

Document the pre-cloud environment, runtime storage, database, and deployment decision boundaries for ReqFlow before any production hosting work begins.

### In Scope

- New cloud-readiness boundary document under `docs/`.
- README/handoff entrypoint links to the new document.
- WT-028 contract, plan queue, and gate evidence.

### Out of Scope

- Selecting a hosting provider or paid service.
- Creating production secrets or committing real secret values.
- PostgreSQL/pgvector migration.
- AI MVP implementation or AI technical brief.
- Deployment workflow or runtime adapter implementation.
- Application source, Prisma schema, migrations, package scripts, or lockfile changes.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Documentation explicitly covers `.env`, `AUTH_SECRET`, `DATABASE_URL`, upload storage, SQLite production risk, and deployment platform boundaries.
- Documentation states SQLite is acceptable only for local/dev/small single-instance evaluation and is not the long-term production concurrency baseline.
- Documentation preserves the MS5 boundary: no PostgreSQL/pgvector migration and no AI implementation.
- README and handoff point readers to the cloud-readiness boundary.
- Validation for documentation-only changes passes.

## Verification Requirements

- `git diff --check`
- targeted consistency search for cloud boundary topics and scope exclusions
- review that no source/config/schema/package files changed

## Rollback Conditions

- Documentation implies production secrets should be committed.
- Documentation selects a paid provider or silently commits to a production platform.
- Documentation hides SQLite production risk or suggests PostgreSQL/pgvector work is part of MS5.
