# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-05-23
- owner: fdch0

## Current Control Level

- repo_scope: active
- worktrack_scope: closed

## Active Worktrack

-

## Active Milestone

- N/A
- milestone_status: none

## Baseline Branch

- develop

## Current Next Action

-

## Linked Formal Documents

- repo_snapshot: .servo/repo/snapshot-status.md
- repo_analysis: .servo/repo/analysis.md
- worktrack_contract:
- plan_task_queue:
- gate_evidence:
- milestone_backlog: .servo/repo/milestone-backlog.md
- worktrack_backlog: .servo/repo/worktrack-backlog.md

## Approval Boundary

- needs_programmer_approval: false
- reason:
- approval_scope:
- approval_persistence: one-shot

## Continuation Authority

- post_contract_autonomy: delegated-minimal
- autonomy_scope: current-goal-only
- max_auto_new_worktracks: 1
- stop_after_autonomous_slice: yes
- subagent_dispatch_mode: auto
- subagent_dispatch_mode_override_scope: worktrack-contract-primary
- subagent_default_model:
- runtime_dispatch_profile:
  - backend_runtime: ClaudeCodeCLI
  - model_family: deepseek-v4-pro
  - subagent_dispatch_shell: Task (SubAgent)
  - runtime_supports_subagent: true
  - subagent_permission_state: approved
  - permission_allows_delegation: true
  - dispatch_package_safety:
  - delegation_attempted:
  - attempted_carrier:
  - carrier_decision:
  - fallback_reason:
- persistent_authority_notes: 用户授予30个Worktrack执行额度，低危险操作可自行审批，SubAgent委派已批准

## Handback Guard

- handoff_state: none
- last_stop_reason:
- last_handback_signature:
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: N/A

## Baseline Traceability

- last_verified_checkpoint:
- latest_observed_checkpoint: 1608c7a8893eee68fe203f4cc921a94524814369
- last_doc_catch_up_checkpoint:
- milestone_input_checkpoint:
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-05-23
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 30
- autonomous_worktracks_opened: 0
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-05-23
- autonomy_budget_notes: 用户授予30个连续Worktrack额度，低危险操作可自行审批

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- 分治策略: 先基本面 → 再分模块治理
