---
title: "Repo Snapshot / Status"
artifact_type: "repo-snapshot-status"
generated_from: "servo-set-harness-goal-skill/assets/repo/snapshot-status.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Repo Snapshot / Status

> 这是 `.servo/repo/snapshot-status.md` 的运行样例，用来记录当前 repo 的慢变量观测面。最终内容应与 `docs/harness/artifact/repo/snapshot-status.md` 的定义一致。

## Metadata

- repo: reqflow
- baseline_branch: develop-aw
- updated: 2026-05-22
- status: initialized-from-existing-code

## Mainline Status

- baseline_branch: develop-aw
- last_verified_checkpoint: ad6e18928365db2616b2731d0e93b4f9481992c3
- checkpoint_ref: ad6e18928365db2616b2731d0e93b4f9481992c3
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
- Active milestone: `MS-20260522-001` (`Establish Verifiable Governance Baseline`).
- Closed worktrack: `WT-20260522-001-validation-environment-baseline` merged at `ad6e18928365db2616b2731d0e93b4f9481992c3`.
- Worktree discipline is mandatory: no direct code edits in the main checkout.
- Next.js code changes require reading relevant installed docs from `node_modules/next/dist/docs/`.
- No `origin` remote is configured; remote-based baseline/fetch instructions need adjustment or a remote must be added before relying on them.
- Current formal linked artifacts: `.servo/goal-charter.md`, `.servo/control-state.md`, `.servo/repo/discovery-input.md`, `.servo/repo/analysis.md`, `.servo/repo/snapshot-status.md`, `.servo/worktrack/*`.

## Known Issues And Risks

- `docs/handoff.md` appears partly stale compared with current schema/routes that include notifications and attachments.
- `npm run lint` remains red with existing code quality findings and is assigned to `WT-20260522-002-lint-quality-baseline`.
- No dedicated unit or e2e test suite is declared; `npm run lint`, `npm run build`, and `npm run db:validate` are the primary observed verification commands.
- SQLite and local file uploads are local-development friendly but need explicit production strategy before deployment use.
- NextAuth v5 beta and Next.js 16 API behavior are version-sensitive.
- Database binary files exist in the repo and should not be changed accidentally by unrelated worktracks.

## Notes

- Initial snapshot was created from read-only discovery plus programmer-confirmed goal inputs. The next Harness loop should run `RepoScope.Observe` before deciding any worktrack.
- Worktree validation environment baseline is now established: `.env.example` is committed, `.env` stays ignored, `db:validate` script exists, and Turbopack root is pinned to `process.cwd()`.
