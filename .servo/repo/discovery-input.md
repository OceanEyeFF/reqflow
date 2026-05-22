---
title: "Repo Discovery Input"
artifact_type: "repo-discovery-input"
generated_from: "servo-set-harness-goal-skill/assets/repo/discovery-input.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Repo Discovery Input

> 这是 `.servo/repo/discovery-input.md` 的运行样例，用于 Existing Code Project Adoption 模式下记录既有代码库的只读事实输入。它不是 goal truth。

## Metadata

- repo: reqflow
- owner: servo-kernel
- updated: 2026-05-22
- adoption_mode: existing-code-adoption
- source_scope: committed `develop` baseline at `e8f380a84dbcdcb335256ee28e866a3788fecc2e`, new worktree branch `develop-aw`, and programmer-confirmed goal inputs from this session
- generated_by: Codex harness-skill -> set-harness-goal-skill

## Source Materials

- repository_path: E:\repos\personal\reqflow\.worktrees\develop-aw
- baseline_branch: develop-aw
- current_branch: develop-aw
- current_commit: e8f380a84dbcdcb335256ee28e866a3788fecc2e
- working_tree_state: clean before `.servo` generation; `.servo/` added during initialization
- user_provided_context: baseline branch should be newly created `develop-aw`; initialize as existing-code adoption; long-term ReqFlow goal confirmed as correct
- inspected_paths: `AGENTS.md`, `package.json`, `README.md`, `docs/handoff.md`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `src/app/**`, `src/auth/index.ts`, `src/lib/**`, `src/components/**`, `src/types/**`
- skipped_paths: `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`, binary database contents, and dirty/untracked files in the original main checkout that are not part of the committed worktree baseline

## Repository Facts

- primary_language_or_stack: Next.js 16.2.6 App Router, React 19.2.4, TypeScript 5, TailwindCSS v4, Prisma 5, SQLite, NextAuth v5 beta
- package_or_build_system: npm with `package-lock.json`; scripts include `dev`, `build`, `start`, `lint`, `db:seed`, and `db:studio`
- runtime_entrypoints: `npm run dev`, `npm run start`, `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/api/**/route.ts`
- test_entrypoints: `npm run lint`; no committed unit or e2e test runner was observed
- deploy_or_release_entrypoints: no dedicated deploy script observed; default Next.js build/start path exists
- configuration_files: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `.gitignore`, `prisma/schema.prisma`, `package.json`

## Architecture And Module Inventory

- App shell: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/providers.tsx`
- Auth: `src/auth/index.ts`, `src/app/login/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/me/route.ts`, `src/types/next-auth.d.ts`
- Dashboard UI: `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/tickets/**`
- API surface: tickets, ticket stats, comments, members, logs, attachments, notifications, users, and auth routes under `src/app/api/**`
- Data layer: `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `src/lib/prisma.ts`
- UI primitives: `src/components/ui/button.tsx`, `badge.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`
- Shared logic/types: `src/lib/notifications.ts`, `src/lib/utils.ts`, `src/types/index.ts`

## Build, Test, And Runtime Signals

- build_commands_seen: `npm run build`
- test_commands_seen: `npm run lint`
- runtime_commands_seen: `npm run dev`, `npm run start`, `npm run db:seed`, `npm run db:studio`
- commands_not_run: No build, lint, Prisma, or dev-server commands were run during discovery; initialization was based on read-only file inspection and git metadata.

## Governance And Documentation Signals

- existing_docs: `README.md` is mostly create-next-app default; `docs/handoff.md` describes ReqFlow status, startup steps, test accounts, known issues, and planned phases
- agent_or_harness_instructions: `AGENTS.md` requires reading installed Next.js docs before Next code changes and requires worktree-only code modifications
- ownership_or_layering_rules: code changes should use feature/worktrack branches from the approved baseline and merge only after validation
- review_or_verify_rules: Harness goal requires implementation, validation, and policy gates per worktrack; current repo has lint/build scripts but no dedicated test suite
- known_policy_constraints: no direct main checkout edits; no goal changes without programmer approval; no silent expansion of Harness autonomy

## Risks And Unknowns

- No `origin` remote is configured, so remote baseline discovery and `git fetch origin` examples in docs are not currently executable.
- `docs/handoff.md` in the committed worktree appears partially stale relative to schema/routes that include attachments and notifications.
- There is no observed unit/e2e test suite; verification currently leans on lint/build and code review unless a worktrack adds tests.
- SQLite and local filesystem uploads are acceptable for local development but remain production-readiness risks.
- NextAuth v5 beta and Next.js 16 require current installed documentation checks before API-sensitive work.
- Binary SQLite files are present in the repo; future worktracks should avoid accidental database churn unless explicitly scoped.

## Candidate Goal Signals

> 只记录从既有代码、文档或用户说明中可追溯的候选目标信号。不要把这些条目写成已确认目标；确认后的长期目标只能进入 `.servo/goal-charter.md`。

- User-confirmed long-term signal: ReqFlow is a lightweight internal ticket/request collaboration system.
- Code signal: existing implementation covers protected dashboard, ticket CRUD, comments, members, logs, attachments, notifications, auth, Prisma schema, migrations, and seed data.
- Documentation signal: handoff identifies productionization concerns including Tailwind v4 changes, NextAuth beta, Prisma stability, SQLite limits, and future PostgreSQL migration.
- Governance signal: future changes must follow worktree discipline and Next.js installed-doc inspection.

## Confirmation Questions

- N/A; programmer confirmed baseline branch, adoption mode, and long-term goal for initialization. Future feature priorities should be decided by RepoScope.Observe -> RepoScope.Decide.

## Downstream Mapping Notes

- goal_charter_inputs: use the confirmed long-term goal plus candidate signals above; do not treat discovery-only facts as unapproved new goals
- snapshot_status_inputs: use current committed worktree branch `develop-aw`, HEAD `e8f380a84dbcdcb335256ee28e866a3788fecc2e`, observed package stack, architecture inventory, governance constraints, and risk list
- control_state_links: link `repo/snapshot-status.md`, `repo/analysis.md`, `worktrack/contract.md`, `worktrack/plan-task-queue.md`, and `worktrack/gate-evidence.md`; keep control state limited to control-plane fields

## Notes

- This discovery input records adoption evidence only. It is not a substitute for `goal-charter.md`, `snapshot-status.md`, or any future worktrack contract.
