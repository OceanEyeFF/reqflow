# Worktrack Contract: WT-20260524-018

## Metadata

- worktrack_id: WT-20260524-018
- title: 脏状态盘点与治理策略矩阵
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; current milestone purpose is repo hygiene and AI collaboration governance; no release/package/deploy changes are in scope.
- snapshot_freshness: repo snapshot and control-state are older than current HEAD, but the candidate worktrack is a docs-only inventory of the observed dirty state and does not depend on fresh implementation truth; refresh is deferred to closeout.
- milestone_purpose_alignment: directly supports completion signal 1 by classifying current dirty state and producing a reviewable governance matrix.
- historical_conflict_risk: no conflict with completed M3 testing milestone; current dirty files and tracked DB changes are explicitly part of M4 governance.
- worktrack_adjustment_recommendations: keep as a standalone docs slice; do not combine with ignore-rule or deletion worktracks.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 9267d676e25c8c1a407163becb009f37744b0f85
- work_branch: worktrack/wt-20260524-018-dirty-state-matrix
- worktree_path: .worktrees/wt-20260524-018-dirty-state-matrix

## Scope

### Goal

Create a reviewable dirty-state inventory and governance strategy matrix for the current repository state.

### In Scope

- Document tracked dirty files, tracked deleted files, untracked local tool directories, worktrees, screenshots, cookies, logs, database artifacts, and candidate docs.
- Assign each category a recommended action: keep, ignore, delete, restore, migrate, or defer.
- Record risk and approval boundaries for later cleanup worktracks.
- Create WT-018 contract, plan, and gate evidence.

### Out of Scope

- Deleting files or directories.
- Restoring tracked database artifacts.
- Editing `.gitignore`.
- Cleaning worktrees or branches.
- Changing application source behavior.
- Pushing to remotes or changing CI/CD.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

- The matrix classifies every visible dirty status category from the baseline checkout.
- Each category has a recommended action and a clear risk/approval note.
- Dangerous follow-up actions are explicitly deferred to later worktracks or programmer approval.
- The worktrack remains docs-only and does not hide, delete, or restore any dirty state.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`
- `git diff --check`

## Rollback Conditions

- Matrix omits a major dirty-state category visible in `git status`.
- Documentation prescribes destructive cleanup without a later worktrack or approval boundary.
- Non-documentation files are changed in this worktrack.
