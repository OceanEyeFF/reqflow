# Worktrack Contract: WT-20260523-014

## Metadata

- worktrack_id: WT-20260523-014
- title: Attachments/Notifications API route handler 集成测试
- milestone_id: MS-20260523-003
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 8926d0af8088c8f9a11b5c11267e88b620a8d74b
- work_branch: worktrack/wt-20260523-014-attachments-notifications
- worktree_path: .worktrees/wt-20260523-014-attachments-notifications

## Scope

### Goal

Add integration tests for Attachments and Notifications API route handlers using isolated Prisma/SQLite databases and controlled upload file cleanup.

### In Scope

- `src/app/api/tickets/[id]/attachments/route.test.ts`
- `src/app/api/notifications/route.test.ts`
- Worktrack Gate evidence and control-plane closeout
- Test-only upload file cleanup in worktree-local `public/uploads`

### Out of Scope

- UI upload tests
- Storage abstraction refactor
- Production behavior changes unless a blocking regression is proven
- New dependencies

## Acceptance Criteria

- Attachments route tests cover auth failure, missing ticket, missing file, upload success, forbidden delete, and delete success.
- Attachment upload tests verify DB record and file-system side effect without leaving test files behind.
- Notifications route tests cover auth failure, unread filtering, batch mark-read validation/scope, single mark-read ownership, and read-all.
- Tests do not depend on `prisma/dev.db`.
- `npm run lint`, `npm run test`, and `npm run build` pass after merge.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Tests leave uploaded files in `public/uploads`.
- Tests mutate development DB state.
- Build or lint fails after merge.
