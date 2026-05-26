# Worktrack Contract: WT-20260526-027

## Metadata

- worktrack_id: WT-20260526-027
- title: GitHub 推送与 CI 验证
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: refactor
- status: completed
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-001`; baseline branch `develop`; WT-20260526-026 added `.github/workflows/ci.yml`; GitHub is `origin`; Gitee remains deferred.
- snapshot_freshness: `.servo/repo/snapshot-status.md`, `.servo/repo/analysis.md`, `.servo/repo/worktrack-backlog.md`, `.servo/milestone/MS-20260526-001.md`, and `.servo/control-state.md` identify WT-20260526-027 as next.
- milestone_purpose_alignment: directly supports MS5 completion signal 3 by pushing `develop` to GitHub and recording the GitHub Actions run result.
- historical_conflict_risk: remote authentication or CI failure may require handback or a follow-up recovery worktrack; no Gitee push or deployment behavior is in scope.
- worktrack_adjustment_recommendations: keep scope to GitHub `develop` push, remote CI status observation, and evidence writeback.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: d9ffff92b6dd599d9cef9455304a4386bc0fb93d
- work_branch: worktrack/wt-20260526-027-github-push-ci-verify
- worktree_path: .worktrees/wt-20260526-027-github-push-ci-verify

## Scope

### Goal

Push the current `develop` baseline to GitHub and record the resulting GitHub Actions CI run status.

### In Scope

- Push `develop` to `origin` (GitHub).
- Observe GitHub Actions workflow status for the pushed commit.
- Record WT-027 contract, plan queue, gate evidence, and repo-refresh state.
- Use only the existing `.github/workflows/ci.yml` created by WT-026.

### Out of Scope

- Gitee push or troubleshooting.
- Workflow design changes unless required as recovery after a verified GitHub CI failure.
- Cloud deployment, production secrets, paid services, or hosting platform selection.
- PostgreSQL/pgvector migration.
- AI MVP implementation or technical brief.
- Application source, schema, migration, package script, or lockfile changes.

## Typed Execution Policy

- baseline_form: commit-on-refactor-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- `develop` is pushed to GitHub `origin/develop`.
- GitHub Actions CI run for the pushed commit is observed and recorded.
- If remote authentication or GitHub Actions access fails, the failure is recorded and handback is triggered without changing Gitee/deployment scope.
- No unrelated source, deployment, database, AI, or Gitee changes occur.

## Verification Requirements

- `git status --short --branch`
- `git push origin develop`
- remote GitHub Actions run observation for the pushed commit
- evidence of final remote state or explicit remote-access blocker

## Rollback Conditions

- Push targets a non-GitHub remote or wrong branch.
- Remote interaction requires credentials not available in the environment.
- CI failure indicates the WT-026 workflow is broken and cannot be fixed inside WT-027 without recovery planning.
