# Worktrack Contract: WT-20260523-012

## Metadata

- worktrack_id: WT-20260523-012
- title: Tickets API route handler 集成测试
- milestone_id: MS-20260523-003
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 7af4e31551fd8a360cbe0a011b108c3748519f2b
- work_branch: worktrack/wt-20260523-012-tickets-api-tests
- worktree_path: .worktrees/wt-20260523-012-tickets-api-tests

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-test-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: WT-011 test fixtures completed
- snapshot_freshness: latest checkpoint observed at 7af4e31551fd8a360cbe0a011b108c3748519f2b
- milestone_purpose_alignment: covers Tickets route handlers, the first API module test slice in M3
- historical_conflict_risk: medium; route tests require real Prisma DB isolation and auth mocks
- worktrack_adjustment_recommendations: include stats route with tickets route coverage
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- dispatch_package_safety: safe; no production behavior changes intended

## Scope

### Goal

Add integration tests for Tickets API route handlers using the WT-011 shared route testing helpers.

### In Scope

- `src/app/api/tickets/route.test.ts`
- `src/app/api/tickets/[id]/route.test.ts`
- Small additions to `src/test/api-test-helpers.ts` needed by ticket tests
- Vitest config adjustment for Prisma singleton safety

### Out of Scope

- Comments/Members/Logs tests
- Attachments/Notifications tests
- Production route behavior changes unless tests reveal a blocking bug
- New dependencies

## Acceptance Criteria

- Tickets list/create/stats route handlers have success and failure coverage.
- Ticket detail/update/delete route handlers have success and failure coverage.
- Tests use isolated SQLite test DBs under `prisma/test-dbs/`.
- Tests mock `@/auth.auth()` and do not depend on `prisma/dev.db`.
- `npm run lint`, `npm run test`, and `npm run build` pass after merge.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Tests mutate development DB state.
- Tests require external services.
- Build or lint fails after merge.
