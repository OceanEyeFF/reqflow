# Repo Hygiene Strategy Matrix

## Purpose

This document records the dirty-state inventory for `MS-20260524-001 / WT-20260524-018`.
It is a decision matrix only. It does not delete, restore, ignore, or stage any file.

## Snapshot

- observed_on: 2026-05-26
- baseline_branch: `develop`
- baseline_ref: `9267d676e25c8c1a407163becb009f37744b0f85`
- active_milestone: `MS-20260524-001`
- worktrack: `WT-20260524-018`
- observed_status_source: `git status --short --branch` from the baseline checkout
- sidecar_review: read-only explorer review completed; no writes, deletes, staging, or commits were performed by the sidecar.

## Control Principles

1. Do not manufacture a clean status by hiding real repository problems.
2. Treat tracked database files separately from untracked runtime noise.
3. Defer destructive cleanup until the owning worktrack verifies paths, contents, branch registration, and user value.
4. Keep source, tests, migrations, Harness/Servo artifacts, and project documentation visible unless explicitly classified.
5. Do not commit secrets, cookies, local logs, build caches, package caches, editor state, or generated runtime databases.

## Strategy Matrix

| Category | Observed Paths | Current State | Recommended Action | Owner Worktrack | Risk / Approval Boundary |
|---|---|---|---|---|---|
| AI collaboration rules | `AGENTS.md` | tracked modified | keep if the worktree workflow rules are still canonical; otherwise reconcile with control-state before commit | `WT-20260524-021` | Low risk as docs, but canonical workflow rules affect all agents and should not be silently rewritten outside the AI entrypoint worktrack. |
| Prisma development DB | `prisma/dev.db` | tracked modified | defer; decide whether to remove from Git tracking, restore to baseline, or replace with seed-only workflow | `WT-20260524-022` | Medium risk. Contains local mutable state and may include sample/user data. Restoration or untracking must be explicit. |
| Prisma DB journal | `prisma/dev.db-journal` | tracked deleted | defer; likely remove from Git tracking after verifying no migration truth depends on it | `WT-20260524-022` | Medium risk. A journal file is runtime state, but deleting a tracked file changes repository history surface. |
| Root development DB | `dev.db` | tracked clean but should be reviewed | defer; compare purpose against `prisma/dev.db` and decide whether it should remain tracked | `WT-20260524-022` | Medium risk. Duplicate SQLite state can confuse `DATABASE_URL` behavior and deployment preparation. |
| Repo-local agent/tool directories | `.agents/`, `.claude/`, `.opencode/`, `.playwright-mcp/` | untracked directories | classify per directory before ignore/delete; keep only canonical skill/control assets that are intentionally repo-owned | `WT-20260524-019`, `WT-20260524-021` | High variance. `.opencode/tmp` is likely low-value cache noise; `.agents/.claude` may contain collaboration assets. Bulk deletion requires path and content review. |
| Governance and planning candidates | `.harness/`, `.mavis/`, `docs/phase6-8-plan.md` | untracked directories/files | inspect and either migrate into canonical `.servo`/`docs` locations, commit as historical planning docs, or archive/delete | `WT-20260524-021`, `WT-20260524-023` | Medium risk. These may hold useful governance context, but committing duplicate control planes or stale plans would confuse future agents. |
| Worktree container | `.worktrees/` | untracked directory with active and historical worktrees | defer cleanup to worktree governance; do not ignore before confirming desired visibility | `WT-20260524-020` | Medium to high risk. Contains separate checkouts and may contain unmerged work. Deletion requires `git worktree list` and per-worktree status checks. |
| Runtime/debug logs | `dev-backend.err.log`, `dev-backend.out.log` | untracked files | ignore and delete after confirming no needed diagnostic content remains | `WT-20260524-019` | Low risk. Do not commit. Deletion is safe only after current debugging session ends. |
| Browser/session artifacts | `cookies.txt` | untracked file | delete locally and add ignore rule | `WT-20260524-019` | Potentially sensitive. Do not commit. Deletion is low risk but should be explicit. |
| Screenshots/manual QA images | `app-tickets.png`, `login-page.png`, `tickets-new.png`, `tickets-page.png` | untracked files | either move to documented QA evidence location or delete; do not leave as root noise | `WT-20260524-019`, `WT-20260524-023` | Low to medium risk. May be useful evidence, but root-level screenshots do not belong in normal status. |
| Scratchpad | `scratchpad.md` | untracked empty or local note file | delete or ignore if used as local-only scratch | `WT-20260524-019` | Low risk if empty; verify before deletion. |
| Nested Prisma runtime directory | `prisma/prisma/` | untracked directory | inspect origin; likely generated/misplaced runtime DB artifacts to delete or ignore | `WT-20260524-022` | Medium risk. Path suggests accidental nested runtime state; verify contents before removal. |
| Build/cache/dependency outputs | `.next/`, `node_modules/` | ignored by current `.gitignore` | no action except keep ignored | N/A | Low risk. Already covered. |
| Environment secrets | `.env` | ignored by current `.gitignore` | keep ignored; document required cloud variables separately | `WT-20260524-023` or deployment work | Sensitive. Never commit. |

## Follow-Up Worktrack Mapping

- `WT-20260524-019`: add or refine `.gitignore` rules for logs, cookies, local screenshots if not retained, scratchpads, runtime tool output, and generated caches.
- `WT-20260524-020`: inspect registered worktrees and stale branches; remove only after verifying clean status and merge state. Give special attention to `develop-aw`, which sidecar review flagged as both divergent and locally dirty.
- `WT-20260524-021`: reconcile `AGENTS.md`, `CLAUDE.md`, and repo-local AI entrypoints with the canonical worktree discipline.
- `WT-20260524-022`: decide tracked database policy for `dev.db`, `prisma/dev.db`, `prisma/dev.db-journal`, and nested `prisma/prisma/`.
- `WT-20260524-023`: update README, RepoStatus, and handoff docs after cleanup decisions are implemented.
- `WT-20260524-024`: final independent review after the cleanup worktracks complete.

## Explicit Non-Actions In This Worktrack

- No files are deleted.
- No tracked database file is restored or untracked.
- No `.gitignore` rule is added.
- No worktree or branch is removed.
- No source code behavior changes are made.

## Acceptance Mapping

| Milestone Signal | WT-018 Contribution |
|---|---|
| Dirty state classified into keep/ignore/delete/restore/defer decisions | Provides initial classification and delegates executable cleanup to later worktracks. |
| No low-value noise in `git status` | Identifies noise categories but does not hide them yet. |
| Worktree and branch entropy reviewed | Defines the worktree cleanup boundary for `WT-20260524-020`. |
| AI entrypoints reflect current workflow | Identifies `AGENTS.md` reconciliation for `WT-20260524-021`. |
| Prisma dev DB policy executed | Identifies DB artifacts and routes policy execution to `WT-20260524-022`. |
