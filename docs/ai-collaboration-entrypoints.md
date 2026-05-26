# AI Collaboration Entrypoints

## Purpose

This document records which AI-agent-facing files are canonical for this repository and how local agent/tool outputs should be treated.

## Canonical Entrypoints

| Entrypoint | Status | Purpose |
|---|---|---|
| `AGENTS.md` | canonical | Repo-level instructions for coding agents. It contains the Next.js 16 local-doc requirement and the mandatory worktree workflow. |
| `CLAUDE.md` | pointer | Minimal pointer to `AGENTS.md`. Keep it small to avoid drift between agent instruction files. |
| `.servo/` | canonical Harness control plane | Repo-owned milestone, worktrack, control-state, snapshot, and backlog artifacts. |
| `.servo/worktrack/*` | canonical worktrack evidence | Stores contracts, plan queues, and gate evidence that should remain versioned when created by the Harness workflow. |

## Non-Canonical Local Outputs

| Path | Treatment | Reason |
|---|---|---|
| `.agents/` | local/generated unless explicitly promoted | Contains runtime-installed skill mirrors and payload metadata. Do not bulk commit without a separate curation decision. |
| `.claude/` | local/generated unless explicitly promoted | Contains Claude-compatible skill mirrors and installer assets. Keep out of normal commits unless a specific artifact is intentionally curated. |
| `.harness/` | governance candidate, not canonical yet | Contains older/adjacent harness-style docs. Review in documentation sync before committing or deleting. |
| `.mavis/` | planning candidate, not canonical yet | Contains planning artifacts that may be useful history but are not the active control plane. Review in documentation sync. |
| `.opencode/` | local tool runtime output | Ignore caches/dependencies; do not commit runtime state. |
| `.playwright-mcp/` | local browser/session output | Ignore runtime state and snapshots unless intentionally exported as test evidence. |

## Required Workflow For Code Changes

1. Start from `develop`.
2. Create a dedicated Git worktree and branch for the active worktrack.
3. Make changes only inside that worktree.
4. Validate in the worktree.
5. Merge back to `develop`.
6. Remove the completed worktree.

Direct edits in the main `develop` checkout are allowed only for read-only inspection or explicit Harness closeout/writeback steps that are already backed by completed worktree evidence.

## Promotion Rules

Local agent/tool outputs may be promoted into version control only when all of these are true:

1. The artifact has a stable repo purpose.
2. It does not duplicate or contradict `.servo/` control truth.
3. It does not contain local credentials, cookies, machine paths, generated caches, or stale runtime state.
4. The owning worktrack records why it is being promoted.

## Deferred Decisions

- Whether any `.harness/` files should be migrated into `docs/`.
- Whether `.mavis/plans/phase6-8.yaml` should be archived as historical planning context.
- Whether `.agents/` or `.claude/` should have a curated minimal tracked subset.
