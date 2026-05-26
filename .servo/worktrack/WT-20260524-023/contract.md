# Worktrack Contract: WT-20260524-023

## Metadata

- worktrack_id: WT-20260524-023
- title: 文档与 RepoStatus 同步
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: docs
- status: ready_for_closeout
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; WT-018 through WT-022 have changed repo hygiene, AI entrypoint, worktree, and Prisma DB governance facts.
- snapshot_freshness: `.servo/repo/snapshot-status.md` and `.servo/repo/analysis.md` still describe the pre-M4 state; `README.md` and `docs/handoff.md` still present tracked local DB files as project facts.
- milestone_purpose_alignment: directly supports completion signal 6 by synchronizing user-facing documentation and RepoStatus with implemented hygiene rules.
- historical_conflict_risk: documentation-only updates may accidentally overstate milestone acceptance before WT-024 and programmer final acceptance.
- worktrack_adjustment_recommendations: update docs to reflect completed M4 worktracks without marking the milestone accepted.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 0d42fd562118d3bc7b3c61641cd3811cc12dcd1b
- work_branch: worktrack/wt-20260524-023-docs-repostatus-sync
- worktree_path: .worktrees/wt-20260524-023-docs-repostatus-sync

## Scope

### Goal

Synchronize README, handoff, and RepoStatus artifacts with the repository hygiene and AI collaboration decisions already implemented in MS-20260524-001.

### In Scope

- `README.md`
- `docs/handoff.md`
- `.servo/repo/snapshot-status.md`
- `.servo/repo/analysis.md`
- WT-023 contract, plan, and gate evidence

### Out of Scope

- Source code behavior changes
- New `.gitignore` rules
- Worktree or branch deletion
- Local database deletion or regeneration
- Marking the milestone completed or accepted

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Acceptance Criteria

- Project documentation no longer claims local SQLite DB files are tracked project state.
- Handoff documentation reflects current worktree discipline, AI entrypoint rules, and M4 governance documents.
- RepoStatus and RepoScope analysis reflect active M4 progress and remaining WT-024 final review.
- Milestone acceptance remains pending programmer decision.
- Validation commands pass.

## Verification Requirements

- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Documentation contradicts implemented `.gitignore`, DB governance, or worktree policy.
- RepoStatus incorrectly marks MS-20260524-001 accepted/completed before final review and programmer acceptance.
- Validation fails due to this worktrack.
