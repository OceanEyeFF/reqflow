# Worktrack Contract: WT-20260526-026

## Metadata

- worktrack_id: WT-20260526-026
- title: GitHub Actions CI 基线
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-001`; baseline branch `develop`; WT-20260526-025 completed RepoStatus refresh; GitHub CI is the next declared MS5 slice.
- snapshot_freshness: `.servo/repo/snapshot-status.md`, `.servo/repo/worktrack-backlog.md`, `.servo/repo/milestone-backlog.md`, and `.servo/control-state.md` identify WT-20260526-026 as next after WT-025.
- milestone_purpose_alignment: directly supports MS5 completion signal 2 by adding a baseline GitHub Actions workflow covering install, lint, test, and build.
- historical_conflict_risk: low to medium; CI must use existing npm scripts and must not introduce deployment, PostgreSQL, pgvector, AI implementation, or Gitee behavior.
- worktrack_adjustment_recommendations: keep the slice to workflow creation and CI-specific harness artifacts; defer remote push/run verification to WT-20260526-027.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 3373b6fbd2440d3938e9d738f8a608d0b68ff680
- work_branch: worktrack/wt-20260526-026-github-actions-ci
- worktree_path: .worktrees/wt-20260526-026-github-actions-ci

## Scope

### Goal

Create a GitHub Actions baseline CI workflow that uses the repository's existing quality scripts and provides a repeatable remote gate for MS5.

### In Scope

- `.github/workflows/ci.yml`
- `.gitignore` entries for CI-only SQLite runtime files
- WT-026 contract, plan queue, and gate evidence
- CI environment defaults required for Prisma/SQLite and NextAuth build/test execution
- Next.js build cache configuration based on local Next.js 16 documentation

### Out of Scope

- Pushing to GitHub or verifying a remote workflow run
- Gitee push or CI behavior
- Cloud deployment platform selection or deployment workflow
- PostgreSQL/pgvector migration
- AI MVP implementation or technical brief
- Changes to application source, Prisma schema, migrations, package scripts, or lockfile
- Committing or caching SQLite runtime database files

## Typed Execution Policy

- baseline_form: commit-on-refactor-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- `.github/workflows/ci.yml` exists.
- Workflow triggers on pull requests to `develop`, pushes to `develop`, and manual dispatch.
- Workflow uses `npm ci` rather than `npm install`.
- Workflow uses repository scripts without lowering the gate: `npm run lint`, `npm run test`, and `npm run build`.
- Workflow prepares Prisma/SQLite CI state without relying on committed local databases.
- Workflow provides `AUTH_SECRET`, `DATABASE_URL`, and disables Next telemetry for CI.
- Workflow uses a Prisma-relative SQLite URL that creates `prisma/ci.db`, not a nested `prisma/prisma/` runtime directory.
- Workflow does not introduce deployment, PostgreSQL/pgvector, AI, Gitee, or secret-management changes.
- Local validation passes for the changed workflow and repository quality gates.

## Verification Requirements

- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted workflow review for install/lint/test/build coverage, CI env defaults, and scope exclusions

## Rollback Conditions

- Workflow omits one of the required MS5 quality commands.
- Workflow depends on local `.env`, `prisma/dev.db`, seed data, or committed SQLite runtime files.
- Workflow creates a nested `prisma/prisma/` runtime database path.
- Workflow weakens lint/test/build quality gates or changes package scripts.
- Any deployment, database migration, AI implementation, or remote push behavior is introduced.
