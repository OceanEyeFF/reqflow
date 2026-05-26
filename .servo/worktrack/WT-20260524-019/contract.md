# Worktrack Contract: WT-20260524-019

## Metadata

- worktrack_id: WT-20260524-019
- title: `.gitignore` 与临时产物治理
- milestone_id: MS-20260524-001
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-26
- updated: 2026-05-26

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260524-001`; baseline branch `develop`; WT-018 produced the dirty-state matrix used as input.
- snapshot_freshness: current HEAD includes WT-018 closeout, so the hygiene matrix is fresh enough for low-risk ignore-rule changes.
- milestone_purpose_alignment: directly supports completion signal 2 by reducing low-value temporary status noise without hiding tracked DB or governance issues.
- historical_conflict_risk: no conflict with prior milestones; destructive cleanup is excluded.
- worktrack_adjustment_recommendations: keep as ignore-rule and temp-artifact policy only; leave worktrees, DB policy, and AI entrypoint canonicalization to later worktracks.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 8cd5f0d2ad06d3a51a61ec94abdaf088584cb7fd
- work_branch: worktrack/wt-20260524-019-ignore-temp-artifacts
- worktree_path: .worktrees/wt-20260524-019-ignore-temp-artifacts

## Scope

### Goal

Add conservative ignore rules for local temporary artifacts identified by WT-018.

### In Scope

- `.gitignore`
- WT-019 contract, plan, and gate evidence
- Low-risk local-only artifacts: logs, cookies, scratchpad, root screenshots, Playwright MCP runtime output, and `.opencode` cache/dependency output

### Out of Scope

- Ignoring or deleting `.agents/`, `.claude/`, `.harness/`, `.mavis/`, or `.worktrees/` wholesale
- Database tracking policy for `dev.db`, `prisma/dev.db`, `prisma/dev.db-journal`, or `prisma/prisma/`
- Worktree or branch cleanup
- Deleting local files
- Changing application source behavior

## Typed Execution Policy

- baseline_form: commit-on-refactor-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Acceptance Criteria

- `.gitignore` reduces low-value local noise identified in WT-018.
- New ignore rules do not hide source, tests, migrations, Harness/Servo artifacts, or project documentation.
- Tracked database issues remain visible for WT-022.
- No files are deleted in this worktrack.

## Verification Requirements

- `git check-ignore` sample local artifacts
- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- A new ignore rule hides a repo-owned source, document, migration, or Harness artifact.
- The worktrack performs cleanup deletion instead of ignore-rule governance.
