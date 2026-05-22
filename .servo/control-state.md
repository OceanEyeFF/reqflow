---
title: "Harness Control State"
artifact_type: "control-state"
generated_from: "servo-set-harness-goal-skill/assets/control-state.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Harness Control State

> 这是 `.servo/control-state.md` 的运行样例，用来维护当前 Harness supervisor 的控制面状态，不要把业务真相写进来。
> 每轮 Harness 启动必须先读取本文件，恢复 linked artifact、审批边界、自动性、交接守卫、基线追溯和预算配置；缺失字段只能按 artifact 合同默认值降级解释，不能扩大权限。

## Metadata

- updated: 2026-05-22
- owner: servo-kernel

## Current Control Level

- repo_scope: active
- worktrack_scope: closed

## Active Worktrack

- N/A

## Active Milestone

- active_milestone: MS-20260522-001
- milestone_status: active
- milestone_pipeline_summary: active=1 planned=0 completed=0 superseded=0

## Baseline Branch

- develop-aw

## Current Next Action

- RepoScope.Observe via milestone-status-skill, then RepoScope.Decide for `WT-20260522-002-lint-quality-baseline`

## Linked Formal Documents

- repo_snapshot: repo/snapshot-status.md
- repo_analysis: repo/analysis.md
- worktrack_contract: worktrack/contract.md
- plan_task_queue: worktrack/plan-task-queue.md
- gate_evidence: worktrack/gate-evidence.md

## Approval Boundary

- needs_programmer_approval: false
- reason: Programmer approved initial Harness adoption, baseline branch `develop-aw`, existing-code adoption mode, and the long-term ReqFlow goal on 2026-05-22.
- approval_scope: initial-harness-adoption
- approval_persistence: one-shot

## Continuation Authority

> `subagent_dispatch_mode` 是使用 SubAgent 的 repo 级默认开关。`subagent_dispatch_mode_override_scope: worktrack-contract-primary` 表示默认让工作追踪内的 `runtime_dispatch_mode` 优先；只有显式改为 `global-override` 时，control-state 才压过 worktrack 合同。`auto` 按 Dispatch Decision Policy 选择 SubAgent、专用 skill、generic worker 或 current-carrier；`delegated` 要求真实委派；`current-carrier` 明确关闭 SubAgent 委派。若 `auto` 不能安全委派，必须在结果中写明 `runtime fallback`、权限边界阻断或 `dispatch package unsafe`。
> 用户授予的长期权限、自动性或分派策略变更必须写入本段或 Autonomy Ledger；一次性审批只写入本轮 evidence / handoff，不改变长期默认值。

- post_contract_autonomy: delegated-minimal
- autonomy_scope: current-goal-only
- max_auto_new_worktracks: 1
- stop_after_autonomous_slice: yes
- subagent_dispatch_mode: auto
- subagent_dispatch_mode_override_scope: worktrack-contract-primary
- subagent_default_model: N/A
- runtime_dispatch_profile:
  - backend_runtime: Codex CLI
  - model_family: GPT-5
  - subagent_dispatch_shell: not_probed_during_initialization
  - runtime_supports_subagent: not_probed
  - subagent_permission_state: not_requested
  - permission_allows_delegation: not_evaluated
  - dispatch_package_safety: N/A
  - delegation_attempted: false
  - attempted_carrier: none
  - carrier_decision: current-carrier-fallback-ready
  - fallback_reason: no SubAgent dispatch shell has been proven available in this runtime
- persistent_authority_notes: Conservative defaults only; no persistent authority expansion was approved beyond the initialized control-state defaults.

## Handback Guard

- handoff_state: none
- last_stop_reason: N/A
- last_handback_signature: N/A
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: N/A

## Baseline Traceability

> 记录最近一次 worktrack 关闭后的已验证基线，供后续续跑时快速定位。
> `latest_observed_checkpoint` 与 `last_doc_catch_up_checkpoint` 是 git hash 幂等性锚点，用于避免对同一代码基线重复执行 repo-refresh 和 doc-catch-up。空值表示锚点尚未建立，首次观察必须完整刷新；harness-skill 启动时通过 git rev-parse HEAD 对比这两个字段决定是否跳过重复刷新。

- last_verified_checkpoint: ad6e18928365db2616b2731d0e93b4f9481992c3
- latest_observed_checkpoint: ad6e18928365db2616b2731d0e93b4f9481992c3
- last_doc_catch_up_checkpoint: N/A
- milestone_input_checkpoint: sha256:926135d014aa4378fe6e80e5efd51b6639a8c916c6b117cb270d028669cb54ed
- checkpoint_type: git-commit
- checkpoint_ref: ad6e18928365db2616b2731d0e93b4f9481992c3
- verified_at: 2026-05-22
- if_no_commit_reason: N/A
- alternative_traceability: N/A

## Autonomy Ledger

- autonomy_budget_remaining: 1
- autonomous_worktracks_opened: 0

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Initial control state was created by `RepoScope.SetGoal` in existing-code-adoption mode. The next Harness loop must re-observe the repo before opening any worktrack.
- Milestone `MS-20260522-001` was confirmed by the programmer and activated on 2026-05-22.
- Milestone observe result: `not_achieved`, progress 0/3, next candidate worktrack `WT-20260522-001-validation-environment-baseline`.
- Worktrack `WT-20260522-001-validation-environment-baseline` initialized on branch `worktrack/WT-20260522-001-validation-environment-baseline`.
- Worktrack `WT-20260522-001-validation-environment-baseline` closed and merged into `develop-aw` at `ad6e18928365db2616b2731d0e93b4f9481992c3`; next candidate is `WT-20260522-002-lint-quality-baseline`.
