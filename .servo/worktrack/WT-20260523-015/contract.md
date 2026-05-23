# Worktrack Contract: WT-20260523-015

## Metadata

- worktrack_id: WT-20260523-015
- title: M3 测试文档与回归验证收口
- milestone_id: MS-20260523-003
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: a0508fd9a034d1d5e1e6526c67c3a04ba93466d1
- work_branch: worktrack/wt-20260523-015-m3-docs-regression
- worktree_path: .worktrees/wt-20260523-015-m3-docs-regression

## Scope

### Goal

Close M3 by updating testing documentation and running final regression validation.

### In Scope

- `docs/api-route-testing.md`
- README testing command description if needed
- WT-015 contract, plan, and gate evidence
- M3 milestone completion state and repo status refresh after validation

### Out of Scope

- New route tests
- Production route changes
- New dependencies

## Acceptance Criteria

- API route testing docs describe helper usage, DB isolation, attachment file cleanup, and current M3 coverage.
- README test command description reflects the current Vitest unit/integration suite.
- `npm run lint`, `npm run test`, and `npm run build` pass on `develop` after merge.
- M3 control-plane artifacts reflect completion.

## Verification Requirements

- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Final regression Gate fails.
- Documentation contradicts verified test behavior.
