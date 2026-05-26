# Worktrack Contract: WT-20260524-020

## Metadata

- worktrack_id: WT-20260524-020
- title: Worktree 与分支熵清理
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; WT-018 identified worktree entropy and WT-019 reduced low-value status noise.
- snapshot_freshness: current HEAD includes WT-019 closeout; worktree list and branch state were re-read before cleanup.
- milestone_purpose_alignment: directly supports completion signal 3 by verifying historical worktrees and safely removing merged, clean registered worktrees.
- historical_conflict_risk: destructive directory deletion is avoided unless Git registration and clean/merged state are verified.
- worktrack_adjustment_recommendations: clean only registered worktrees that are clean and whose HEAD is ancestor of `develop`; record divergent/dirty or unregistered directories as deferred.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 3db0e3abaedb513c33c7ca105b87668be98ce222
- work_branch: worktrack/wt-20260524-020-worktree-branch-cleanup
- worktree_path: .worktrees/wt-20260524-020-worktree-branch-cleanup

## Scope

### Goal

Reduce worktree and branch entropy by removing safe registered historical worktrees and recording deferred risks.

### In Scope

- `git worktree list` and branch audit.
- Remove registered worktrees whose trees are clean and whose HEAD commits are included in `develop`.
- Delete corresponding merged worktrack branches.
- Document deferred worktrees/directories that require manual or later-worktrack handling.
- WT-020 contract, plan, and gate evidence.

### Out of Scope

- Deleting `develop-aw`.
- Deleting divergent, dirty, or unregistered directories by raw filesystem removal.
- Cleaning database files inside other worktrees.
- Rewriting branch history.
- Pushing remote branch deletion.

## Typed Execution Policy

- baseline_form: commit-on-refactor-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Acceptance Criteria

- Registered worktrees are audited with clean/dirty and ancestor status.
- Safe registered stale worktrees are removed using `git worktree remove`.
- Merged stale branches are deleted with `git branch -d`.
- Unsafe or ambiguous entries are explicitly recorded as deferred.
- No raw recursive deletion is used for unverified directories.

## Verification Requirements

- `git worktree list --porcelain`
- `git branch --list`
- `git status --short --branch`
- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- A non-merged or dirty worktree is removed.
- Cleanup deletes an unregistered directory without documented review.
- Branch deletion uses force deletion without explicit approval.
