# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-05-27
- owner: fdch0

## Current Control Level

- repo_scope: active
- worktrack_scope: closed

## Active Worktrack

-

## Active Milestone

- active_milestone: MS-20260526-001
- milestone_title: GitHub CI 与上云前决策基线
- milestone_status: active
- milestone_pipeline_summary: total=6 planned=1 active=1 completed=4 superseded=0

## Baseline Branch

- develop

## Current Next Action

- RepoScope.Decide: WT-20260526-026 completed; continue to WT-20260526-027 GitHub 推送与 CI 验证

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
- reason: user granted 30 continuous Worktrack budget and WT-20260526-027 remains inside active MS5 scope
- approval_scope: continue to WT-20260526-027 GitHub 推送与 CI 验证
- approval_persistence: current execution cycle

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

- handoff_state: continuous_execution
- last_stop_reason: N/A
- last_handback_signature:
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: N/A

## Baseline Traceability

- last_verified_checkpoint:
- latest_observed_checkpoint: 59c3493c8249506ea1c69c5cf3559111d219cd21
- last_doc_catch_up_checkpoint: 59c3493c8249506ea1c69c5cf3559111d219cd21
- milestone_input_checkpoint: 59c3493c8249506ea1c69c5cf3559111d219cd21
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-05-27
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 20
- autonomous_worktracks_opened: 10
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-05-23
- autonomy_budget_notes: 用户授予30个连续Worktrack额度，低危险操作可自行审批

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- Phase 9 上一阶段: M3 API route handler 集成测试已验收
- Phase 9 当前阶段: MS-20260526-001 GitHub CI 与上云前决策基线进行中，WT-20260526-026 已完成
- 分治策略: GitHub CI/远端验证 → 上云边界 → AI MVP 技术决策 → AI 需求说明优化 MVP
