# Worktrack Contract: WT-20260524-022

## Metadata

- worktrack_id: WT-20260524-022
- title: Prisma dev DB 状态治理
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: refactor
- status: completed
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; prior hygiene worktracks identified DB artifacts as the main remaining tracked runtime noise.
- snapshot_freshness: current HEAD includes WT-021 closeout; DB tracking state was re-read before changes.
- milestone_purpose_alignment: directly supports completion signal 5 by executing a clear Prisma dev DB versioning policy.
- historical_conflict_risk: removing DB files from Git tracking is an index/history-surface change but does not delete local files in normal developer checkouts.
- worktrack_adjustment_recommendations: remove DB files from tracking, add ignore rules, and document reproducible setup through migrations/seed.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 07365f32bfc527777b06710ec118f4d41d7fef05
- work_branch: worktrack/wt-20260524-022-prisma-dev-db-governance
- worktree_path: .worktrees/wt-20260524-022-prisma-dev-db-governance

## Scope

### Goal

Make Prisma development database files local-only runtime artifacts and document the policy.

### In Scope

- `.gitignore`
- Git index removal for tracked SQLite DB and journal files
- `docs/prisma-dev-db-governance.md`
- WT-022 contract, plan, and gate evidence

### Out of Scope

- Deleting local DB files from the main checkout
- Migrating from SQLite to PostgreSQL
- Changing Prisma schema or migrations
- Changing seed data behavior
- Editing application runtime logic

## Typed Execution Policy

- baseline_form: commit-on-refactor-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Acceptance Criteria

- `dev.db`, `prisma/dev.db`, and `prisma/dev.db-journal` are no longer tracked by Git.
- DB and journal paths are ignored.
- Schema, migrations, and seed files remain tracked.
- Local development setup remains documented.
- Tests and build pass.

## Verification Requirements

- `git ls-files` confirms DB files are removed from tracking.
- `git check-ignore` confirms DB paths are ignored.
- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Schema/migration/seed truth is accidentally removed from version control.
- Test isolation breaks.
- Local setup documentation contradicts Prisma behavior.
