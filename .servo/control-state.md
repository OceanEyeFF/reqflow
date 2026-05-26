# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-05-26
- owner: fdch0

## Current Control Level

- repo_scope: active
- worktrack_scope: closed

## Active Worktrack

-

## Active Milestone

- active_milestone: MS-20260524-001
- milestone_title: 项目整洁度与 AI 适配治理
- milestone_status: active
- milestone_pipeline_summary: total=4 planned=0 active=1 completed=3 superseded=0

## Baseline Branch

- develop

## Current Next Action

- RepoScope.Decide: MS-20260524-001 active; initialize WT-20260524-019 `.gitignore` 与临时产物治理

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
- latest_observed_checkpoint: bad8b6654b12432414b3bfc54c4f84be6cbf82cd
- last_doc_catch_up_checkpoint: 30045cbe49bfba90141baf743ed4cb26dd525717
- milestone_input_checkpoint: bad8b6654b12432414b3bfc54c4f84be6cbf82cd
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-05-26
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 23
- autonomous_worktracks_opened: 7
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-05-23
- autonomy_budget_notes: 用户授予30个连续Worktrack额度，低危险操作可自行审批

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- Phase 9 上一阶段: M3 API route handler 集成测试已验收
- Phase 9 当前阶段: MS-20260524-001 项目整洁度与 AI 适配治理已激活
- 分治策略: 已完成测试夹具 → API 模块覆盖 → 文档与回归收口 → 最终 CodeReview
