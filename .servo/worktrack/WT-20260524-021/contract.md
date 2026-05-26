# Worktrack Contract: WT-20260524-021

## Metadata

- worktrack_id: WT-20260524-021
- title: AI 协作入口规范化
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: docs
- status: completed
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; previous WT-018/019/020 established hygiene matrix, ignore policy, and worktree cleanup evidence.
- snapshot_freshness: current HEAD includes WT-020 closeout; AI entrypoint state was re-read before edits.
- milestone_purpose_alignment: directly supports completion signal 4 by making `AGENTS.md` and AI/tool output boundaries explicit.
- historical_conflict_risk: `.agents/` and `.claude/` contain large generated skill mirrors; bulk committing them would increase noise and duplicate runtime assets.
- worktrack_adjustment_recommendations: commit canonical rule changes and boundary docs only; defer `.harness/.mavis` curation to WT-023.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 70574ef9218f6d6ddc2f47043d2232af81fb3147
- work_branch: worktrack/wt-20260524-021-ai-collaboration-entrypoints
- worktree_path: .worktrees/wt-20260524-021-ai-collaboration-entrypoints

## Scope

### Goal

Normalize AI collaboration entrypoints and document local agent/tool output boundaries.

### In Scope

- `AGENTS.md`
- `CLAUDE.md` if needed
- `docs/ai-collaboration-entrypoints.md`
- WT-021 contract, plan, and gate evidence

### Out of Scope

- Bulk committing `.agents/`, `.claude/`, `.harness/`, or `.mavis/`
- Deleting local agent/tool directories
- Changing Harness goal or milestone scope
- Source code behavior changes

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

- `AGENTS.md` records current worktree discipline.
- `CLAUDE.md` remains a small pointer and does not drift from `AGENTS.md`.
- Local agent/tool directories have documented treatment.
- No sensitive or generated runtime output is committed.

## Verification Requirements

- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Documentation contradicts Harness worktree workflow.
- A generated agent/tool directory is bulk committed.
- Canonical and pointer instruction files diverge.
