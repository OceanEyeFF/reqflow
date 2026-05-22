---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-002-lint-quality-baseline"
milestone_id: "MS-20260522-001"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-002-lint-quality-baseline
- branch: worktrack/WT-20260522-002-lint-quality-baseline
- baseline_branch: develop-aw
- baseline_ref: 6137624
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: ready_for_close

## Node Type

- type: bugfix
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-bugfix-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-001`; validation environment baseline completed; no feature scope authorized.
- snapshot_freshness: fresh at `6137624`; lint failures were captured after validation environment worktrack.
- milestone_purpose_alignment: directly satisfies milestone signal that `npm run lint` must have zero errors or documented accepted warnings.
- historical_conflict_risk: medium because hook and type lint fixes touch UI/API/auth code; keep changes mechanical and behavior-preserving.
- worktrack_adjustment_recommendations: keep as a single lint remediation slice; defer unrelated warnings only if lint exits zero.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- execution_policy_contract_ref: docs/harness/artifact/worktrack/contract.md#execution-policy
- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- allowed_values: auto / delegated / current-carrier
- fallback_reason_required: yes

## Task Goal

- Reduce current baseline lint errors to zero without changing product behavior or expanding into feature work.

## Scope

### Control Signal
- 范围摘要（一句话）：Fix current ESLint errors and directly related warnings that block a trustworthy baseline.

### Supporting Detail
- 详细范围项：Next Link rule violations, React hook lint errors, explicit `any` errors, prefer-const error, and directly related unused imports/variables.

## Non-Goals

- No new product features.
- No route/API redesign.
- No database schema changes.
- No broad styling or UX refactor.
- No docs catch-up beyond evidence updates.

## Impacted Modules

- `src/app/(dashboard)/**`
- `src/app/api/**`
- `src/auth/index.ts`
- `src/components/ui/badge.tsx`
- `.servo/worktrack/*`

## Planned Next State

- `npm run lint` exits successfully.
- `npm run build` and `npm run db:validate` remain passing with documented setup.
- Any remaining warnings are either resolved or explicitly recorded as accepted non-blocking warnings.

## Acceptance Criteria

### Control Signal
- 核心验收项：`npm run lint` exits zero.

### Supporting Detail
- 完整验收标准：No lint errors; build still passes; Prisma validate still passes; diff review confirms behavior-preserving fixes.

## Constraints

### Control Signal
- 关键约束：Mechanical lint bugfix only; do not alter product scope.

### Supporting Detail
- 详细约束条件：Read installed Next docs for Next Link rule context if touching navigation; avoid suppressing rules unless there is a local justification.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `npm run db:validate`
- `git diff --stat`

## Rollback Conditions

### Control Signal
- 回滚触发条件：Fixes require semantic product changes or introduce new failing validation.

### Supporting Detail
- 回滚步骤与回退路径：Revert the worktrack branch and return to RepoScope.Decide with a smaller lint sub-slice.

## Notes

- Second worktrack under `MS-20260522-001`.
