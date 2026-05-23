---
title: "Repo Snapshot / Status"
artifact_type: "repo-snapshot-status"
generated_from: "servo-set-harness-goal-skill/assets/repo/snapshot-status.md"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Repo Snapshot / Status

> 这是 `.servo/repo/snapshot-status.md` 的运行样例，用来记录当前 repo 的慢变量观测面。最终内容应与 `docs/harness/artifact/repo/snapshot-status.md` 的定义一致。

## Metadata

- repo: reqflow
- baseline_branch: develop-aw
- updated: 2026-05-23
- status: collaboration-surface-milestone-active

## Mainline Status

- baseline_branch: develop-aw
- last_verified_checkpoint: 18af24c70a48d26c2d23823cd61ba6d6f582a558
- checkpoint_ref: 18af24c70a48d26c2d23823cd61ba6d6f582a558
- checkpoint_type: git-commit

## Architecture And Module Map

- Product surface: authenticated internal ticket/request collaboration app with login, dashboard, ticket list, ticket creation, ticket detail, comments, members, attachments, logs, notifications, and stats.
- Frontend routing: Next.js App Router under `src/app`, with protected dashboard routes in `src/app/(dashboard)`.
- API routing: route handlers under `src/app/api` for auth, users, tickets, ticket stats, comments, members, logs, attachments, and notifications.
- Auth: NextAuth v5 beta credentials flow in `src/auth/index.ts`, plus current-user API and type augmentation.
- Data model: Prisma 5 schema with User, Ticket, TicketMember, TicketComment, TicketLog, TicketAttachment, Notification, and NextAuth adapter tables.
- Persistence: SQLite development database and Prisma migrations under `prisma/migrations`.
- UI layer: TailwindCSS v4, shared providers, and small UI primitives under `src/components/ui`.

## Active Branches And Purpose

- `develop-aw`: active Harness baseline branch created from `develop` for this adoption.
- `develop`: original development branch remains checked out in the main checkout and had unrelated dirty/untracked files during adoption; Harness mutation should use `develop-aw`.
- Historical/local feature branches observed: `feature/phase6-collaborators`, `feature/phase7-attachments`, `feature/phase7-attachments-frontend`, `feature/phase8-frontend`, `feature/phase8-notifications`.
- `master`: initial branch observed; no current Harness purpose assigned.

## Governance Status

- Harness artifacts initialized under `.servo/` in existing-code-adoption mode.
- Completed milestone: `MS-20260522-001` (`Establish Verifiable Governance Baseline`).
- Completed milestone: `MS-20260522-002` (`Runtime Usability And Smoke Acceptance`), accepted by programmer on 2026-05-23 after visual validation.
- Active milestone: `MS-20260522-003` (`Collaboration Surface Acceptance`), progress 6/6 worktracks complete; next route is Milestone Gate and programmer visual acceptance.
- Closed worktracks:
  - `WT-20260522-001-validation-environment-baseline` merged at `ad6e18928365db2616b2731d0e93b4f9481992c3`.
  - `WT-20260522-002-lint-quality-baseline` merged at `a16986e4e126a531fd613aa9204f9bfd16b0f3f5`.
  - `WT-20260522-003-docs-handoff-catch-up` merged at `28a7966dd248affd9b6099340d59433f48d51d8a`.
  - `WT-20260522-004-runtime-smoke-suite` merged at `426c8a5f32af7ce8b595cc5b694a8306d0ee831c`.
  - `WT-20260522-005-dashboard-ticket-flow-fixes` merged at `41c0649ec9e38ae46ed7ce29d5f693c6a6eb47b8`.
  - `WT-20260522-006-runtime-docs-catch-up` merged at `d59e734213a57502e174fdf35b58fc128f21f522`.
  - `WT-20260522-015-ms002-final-handoff-refresh` merged at `a78cc4b85a618a035e466fdb6e541c815f2daf66`.
  - `WT-20260522-007-attachment-end-to-end-validation` merged at `cc6e22bf0c97493ceef17a3a74f51cf77fa29255`.
  - `WT-20260522-008-notification-user-surface` merged at `8568578686d0cec1d6732784771381bfb63b05ae`.
  - `WT-20260522-009-member-comment-interaction-hardening` merged at `0e1807a251bc3c79e0967b8ceda6a3ee09c7ae92`.
  - `WT-20260522-010-collaboration-docs-catch-up` merged at `409de4ecbae5e0c69c42e4e4e66f685e33e66e2f`.
  - `WT-20260523-016-ticket-modify-permission-hardening` merged at `541bbd73bf3383ea59c4760c1f95457e482dad0f`.
  - `WT-20260523-017-ms003-final-code-review` merged at `18af24c70a48d26c2d23823cd61ba6d6f582a558`.
- Worktree discipline is mandatory: no direct code edits in the main checkout.
- Next.js code changes require reading relevant installed docs from `node_modules/next/dist/docs/`.
- No `origin` remote is configured; remote-based baseline/fetch instructions need adjustment or a remote must be added before relying on them.
- Current formal linked artifacts: `.servo/goal-charter.md`, `.servo/control-state.md`, `.servo/repo/discovery-input.md`, `.servo/repo/analysis.md`, `.servo/repo/snapshot-status.md`, `.servo/worktrack/*`.

## Known Issues And Risks

- Operator-facing handoff docs now reflect the verified baseline, branch/worktree workflow, and current route/model inventory.
- A first Playwright runtime smoke suite exists via `npm run smoke`; broader unit/API/e2e coverage is still missing.
- Runtime smoke screenshots previously found dashboard stats/list count mismatch and new-ticket priority label display issue; both were fixed in `WT-20260522-005-dashboard-ticket-flow-fixes`.
- SQLite and local file uploads are local-development friendly but need explicit production strategy before deployment use.
- NextAuth v5 beta and Next.js 16 API behavior are version-sensitive.
- Database binary files exist in the repo and should not be changed accidentally by unrelated worktracks.

## Notes

- Initial snapshot was created from read-only discovery plus programmer-confirmed goal inputs. The next Harness loop should run `RepoScope.Observe` before deciding any worktrack.
- Worktree validation environment baseline is now established: `.env.example` is committed, `.env` stays ignored, `db:validate` script exists, and Turbopack root is pinned to `process.cwd()`.
- Lint quality baseline is now established: `npm run lint`, `npm run build`, and `npm run db:validate` pass on `develop-aw` after documented local setup.
- Handoff documentation catch-up is now established: `docs/handoff.md` reflects `develop-aw`, verified commands, and current attachment/notification route/model facts.
- Runtime smoke follow-up fixed `/` routing: the create-next-app default `src/app/page.tsx` was removed, so `/` now uses the authenticated dashboard route group; logout is handled by a client-side sign-out button.
- Runtime smoke baseline is now established: `npm run smoke` covers local login, authenticated dashboard, ticket detail, ticket list, new-ticket reachability, and logout with screenshots under ignored `test-results/smoke/`.
- Dashboard/ticket flow fixes are now established: admin personal scopes stay personal unless `scope=all`, unknown ticket scopes fall back to assigned-to-me, and new-ticket priority select displays user-facing labels.
- Runtime operator docs are now caught up: README and `docs/handoff.md` describe setup, smoke coverage, Chrome channel caveat, worktree workflow, and verified WT-005 fixes.
- Final handoff freshness is now caught up: `docs/handoff.md` no longer points to closed WT-006 as the current worktrack and now marks MS-002 at Gate / user visual acceptance.
- MS-002 was accepted by the programmer on 2026-05-23; MS-003 is now active and should start with attachment end-to-end validation.
- Attachment workflow is now locally verified: ticket detail supports upload/list/authenticated download/delete, files are stored under ignored `storage/uploads`, and smoke screenshots cover empty and uploaded states.
- Notification user surface is now locally verified: the dashboard header shows a notification bell/unread badge, users can inspect notifications, mark one/all as read, and navigate from a notification to its ticket detail page.
- Member/comment collaboration is now locally verified: non-participants are blocked from ticket detail/comments/members, admins can add/update collaborators, members can follow notifications to tickets, and comments are visible across authorized participants.
- Collaboration documentation is now caught up: README and handoff describe verified attachment, notification, member, and comment behavior plus deferred production boundaries.
- Ticket mutable fields are now permission-hardened: ordinary collaborators/watchers can read and comment but cannot PATCH status, assignee, or priority.
- MS-003 final CodeReview is now complete: ticket PATCH rejects invalid status/priority values and invalid/missing assignee IDs before database writes.
