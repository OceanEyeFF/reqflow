---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
generated_from: "servo-set-harness-goal-skill/assets/worktrack/contract.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

> 这是 `.servo/worktrack/contract.md` 的运行样例，用来填写单个 worktrack 的局部状态转移合同。
> 按 `Control Signal` / `Supporting Detail` 双层输出：`Control Signal` 只放影响下一动作决策的关键结论；`Supporting Detail` 放完整上下文。

## Metadata

- worktrack_id: N/A
- branch: N/A
- baseline_branch: develop-aw
- baseline_ref: e8f380a84dbcdcb335256ee28e866a3788fecc2e
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: not_initialized

## Node Type

> 从 Goal Charter 的 Engineering Node Map 绑定，决定本 worktrack 的基线策略与判定标准。

- type: N/A
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: N/A
- merge_required: N/A
- gate_criteria: N/A
- if_interrupted_strategy: N/A

## Worktrack Intake Review

> Milestone 派生 worktrack 必须引用 RepoScope.Decide 的 pre-init intake review。

- worktrack_intake_review: N/A
- repo_fundamentals: N/A
- snapshot_freshness: N/A
- milestone_purpose_alignment: N/A
- historical_conflict_risk: N/A
- worktrack_adjustment_recommendations: N/A
- add_remove_worktrack_recommendations: N/A
- intake_review_verdict: N/A
- ready_for_worktrack_init: false

## Execution Policy

> Execution Policy canonical semantics are not repeated here. Use `execution_policy_contract_ref` as the authority reference.

- execution_policy_contract_ref: docs/harness/artifact/worktrack/contract.md#execution-policy
- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- allowed_values: auto / delegated / current-carrier
- fallback_reason_required: yes

## Task Goal

- N/A

## Scope

### Control Signal
- 范围摘要（一句话）：N/A

### Supporting Detail
- 详细范围项：N/A

## Non-Goals

- N/A

## Impacted Modules

- N/A

## Planned Next State

- N/A

## Acceptance Criteria

### Control Signal
- 核心验收项：N/A

### Supporting Detail
- 完整验收标准：N/A

## Constraints

### Control Signal
- 关键约束：No worktrack exists yet; RepoScope.Observe and RepoScope.Decide must run before this contract becomes active.

### Supporting Detail
- 详细约束条件：This placeholder contract only preserves the formal artifact location linked from control-state.

## Verification Requirements

- N/A

## Rollback Conditions

### Control Signal
- 回滚触发条件：N/A

### Supporting Detail
- 回滚步骤与回退路径：N/A

## Notes

- The active worktrack is closed. Do not use this contract as implementation scope until `init-worktrack-skill` replaces it with a specific contract.
