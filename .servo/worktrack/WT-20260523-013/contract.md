# Worktrack Contract: WT-20260523-013

## Metadata

- worktrack_id: WT-20260523-013
- title: Comments/Members/Logs API route handler 集成测试
- milestone_id: MS-20260523-003
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 1dab7b7012791a5679f743236444fb43bc6cf78c
- work_branch: worktrack/wt-20260523-013-comments-members-logs
- worktree_path: .worktrees/wt-20260523-013-comments-members-logs

## Scope

### Goal

Add integration tests for Comments, Members, and Logs API route handlers using the shared Prisma/SQLite route testing helpers.

### In Scope

- `src/app/api/tickets/[id]/comments/route.test.ts`
- `src/app/api/tickets/[id]/members/route.test.ts`
- `src/app/api/tickets/[id]/logs/route.test.ts`
- Small test helper additions only if required
- Worktrack Gate evidence and control-plane closeout

### Out of Scope

- Attachments/Notifications route tests
- UI tests
- Production behavior changes unless a blocking regression is proven
- New dependencies

## Acceptance Criteria

- Comments route tests cover auth failure, list success, validation failure, create success, and notification side effect.
- Members route tests cover list success, missing input, permission denial, add success, delete missing member, and role update success.
- Logs route tests cover auth failure and ordered list success.
- Tests use isolated SQLite test DBs under `prisma/test-dbs/` and do not depend on `prisma/dev.db`.
- `npm run lint`, `npm run test`, and `npm run build` pass after merge.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Tests mutate development DB state.
- Tests require external services.
- Build or lint fails after merge.
