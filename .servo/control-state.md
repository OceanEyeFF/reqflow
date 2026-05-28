# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-05-28
- owner: fdch0

## Current Control Level

- repo_scope: active
- worktrack_scope: closed

## Active Worktrack

- active_worktrack: none
- worktrack_title: none
- worktrack_status: none
- target_milestone_id: none

## Active Milestone

- active_milestone: none
- milestone_title: none
- milestone_status: none
- milestone_pipeline_summary: total=10 planned=2 active=0 completed=8 superseded=0

## Baseline Branch

- develop

## Current Next Action

- RepoScope.Observe: MS8 accepted by fdch0. Next route is choosing/activating a planned milestone.

## Linked Formal Documents

- repo_snapshot: .servo/repo/snapshot-status.md
- repo_analysis: .servo/repo/analysis.md
- worktrack_contract: N/A
- plan_task_queue: N/A
- gate_evidence: N/A
- milestone_backlog: .servo/repo/milestone-backlog.md
- worktrack_backlog: .servo/repo/worktrack-backlog.md

## Approval Boundary

- needs_programmer_approval: true
- reason: MS8 final acceptance has been written back; next planned milestone activation should be decided explicitly.
- approval_scope: next milestone activation decision.
- approval_persistence: next RepoScope decision

## Continuation Authority

- post_contract_autonomy: delegated-minimal
- autonomy_scope: current-goal-only
- max_auto_new_worktracks: 30
- stop_after_autonomous_slice: no
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
- persistent_authority_notes: 用户在 2026-05-27 明确授予 MS7 执行周期 30 个连续 Worktrack 额度，允许 SubAgent、低危险 Worktrack 自审批、连续工作、严格验收、必要时自动新增并执行 Worktrack；MS7 milestone final acceptance 已由用户在 2026-05-28 明确通过。MS8 已按用户请求激活，且需求确认已回答；首个 Worktrack 可在 MS8 范围内初始化。

## Handback Guard

- handoff_state: ms8_accepted_waiting_next_milestone_decision
- last_stop_reason: next_milestone_activation_decision_required
- last_handback_signature:
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: N/A

## Baseline Traceability

- last_verified_checkpoint:
- latest_observed_checkpoint: 836d287a71bc210060f34be2878ab7b4d7f4b651
- last_doc_catch_up_checkpoint: b2baeac
- milestone_input_checkpoint: 836d287a71bc210060f34be2878ab7b4d7f4b651
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-05-28
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 11
- autonomous_worktracks_opened: 19
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-05-27
- autonomy_budget_notes: MS7 执行周期授权；低危险 Worktrack 可自行审批，危险操作、上下文噪声明显或需要用户业务判断时必须 handback。

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- Phase 9 上一阶段: M3 API route handler 集成测试已验收
- Phase 9 当前阶段: MS-20260527-001 管理员知识库管理与导入已完成 11/11 worktracks，并由用户在 2026-05-28 最终验收。
- latest_acceptance: MS-20260528-001 accepted by fdch0 on 2026-05-28 after WT-20260528-062 DB readiness validation
- latest_repo_baseline: 836d287a71bc210060f34be2878ab7b4d7f4b651 (`Merge WT-20260528-062 Prisma DB acceptance check`)
- latest_completed_worktrack: WT-20260528-062 completed and merged at 836d287
- next_worktrack_candidate: none; next milestone activation decision required.
- milestone_final_db_readiness_rule: standing rule added by WT-20260528-063; every future Milestone final handback must include active-checkout/active-DATABASE_URL Prisma Client, `prisma validate`, `prisma migrate status`, active DB schema surface, and Prisma-backed API readiness evidence, or an explicit not-applicable reason.
- latest_ms7_validation_report: docs/ms7-final-validation.md
- ms7_acceptance_handback_reopened: 2026-05-28 programmer feedback; zip upload, delete/cleanup, provider manual test record template.
- active_next_milestone: none
- routed_new_requests: AI answer language selection and multiple/split requirement drafts are in MS8; docs path cleanup moved to MS-20260528-002.
- ms8_requirement_confirmation: answered by fdch0; model is multiple knowledge bases with preserved zip paths, selected deletion, AI page multi-knowledge-base selection, language modes `follow input / Chinese / English`, max 3 split drafts via variable, and single selected draft handoff.
- planned_ms8_addendum: MS-20260528-003 registered for knowledge-base edit/disable-archive lifecycle and AI multi-direction clarification.
- planned_next_milestone: MS-20260528-002 docs 文档更新迭代与整理
- remote_ci: GitHub Actions run `26502063963` success for `b5d50b8b8043dc8a35264cf96553955a4697ba8d`
- 分治策略: GitHub CI/远端验证 → 上云边界 → AI MVP 技术决策 → Deepseek discussion MVP → 管理员知识库导入
