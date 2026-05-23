# Worktrack Contract: WT-20260523-011

## Metadata

- worktrack_id: WT-20260523-011
- title: API 集成测试夹具与测试环境
- milestone_id: MS-20260523-003
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 6c567743a5b4f8b5422f1d3c1b011df57f60f3b2
- work_branch: worktrack/wt-20260523-011-api-test-fixtures
- worktree_path: .worktrees/wt-20260523-011-api-test-fixtures

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-test-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: M1/M2 completed, build/lint/test baseline available
- snapshot_freshness: latest checkpoint observed at 6c567743a5b4f8b5422f1d3c1b011df57f60f3b2
- milestone_purpose_alignment: WT-011 establishes reusable infrastructure for all M3 route handler tests
- historical_conflict_risk: medium; Prisma/SQLite and Next route module imports are order-sensitive
- worktrack_adjustment_recommendations: keep this slice limited to helpers, docs, and helper tests
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- dispatch_package_safety: safe; no destructive operations, no schema changes

## Scope

### Goal

Create shared API route testing helpers and documentation for M3 route handler integration tests without adding dependencies or touching product behavior.

### In Scope

- `src/test/api-test-helpers.ts`
- `src/test/api-test-helpers.test.ts`
- `docs/api-route-testing.md`
- `.gitignore` entry for test databases
- Vitest timeout suitable for Prisma CLI-backed setup

### Out of Scope

- No concrete tickets/comments/members/attachments/notifications route coverage in this worktrack
- No production schema changes
- No PostgreSQL migration
- No runtime dependency additions

## Acceptance Criteria

- Shared helpers provide isolated SQLite database URL creation and cleanup.
- Shared helpers provide `@/auth.auth()` mock, request, params, and JSON response utilities.
- Helper tests pass under `npm run test`.
- `prisma/test-dbs/` is ignored by Git.
- Documentation explains test data isolation and route testing pattern.
- `npm run lint`, `npm run test`, and `npm run build` pass after merge.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Helper code changes production runtime behavior.
- Tests require or mutate `prisma/dev.db`.
- Verification commands fail after dependency/environment recovery.
