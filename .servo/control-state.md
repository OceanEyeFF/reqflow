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

- active_milestone: MS-20260528-003
- milestone_title: MS8 addendum
- milestone_status: active
- milestone_pipeline_summary: total=10 planned=1 active=1 completed=8 superseded=0

## Baseline Branch

- baseline_branch: develop

## Current Next Action

- RepoScope.Observe: MS8 addendum active; refine pending requirement questions with fdch0 before initializing the first addendum worktrack.

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
- reason: fdch0 requested control-plane fundamentals refresh and detailed clarification for the active MS8 addendum; no worktrack execution has been approved in this turn.
- approval_scope: starting any MS8 addendum worktrack or expanding MS8 addendum beyond knowledge-base lifecycle management and AI multi-direction clarification.
- approval_persistence: until fdch0 answers the pending clarification questions and explicitly requests worktrack execution

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

- handoff_state: ms8_addendum_active_waiting_requirement_clarification
- last_stop_reason: requirement_clarification_before_worktrack_init
- last_handback_signature: MS-20260528-003::pending-clarification::2026-05-28
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: N/A

## Baseline Traceability

- last_verified_checkpoint: 8972fc5b16ac60583103944776c20761cc4059d2
- latest_observed_checkpoint: 8972fc5b16ac60583103944776c20761cc4059d2
- last_doc_catch_up_checkpoint: b2baeac
- milestone_input_checkpoint: sha256:400ba316f93d7eb4d1f313e53164d30a4e6fa56f5374c797325e384bd4c32cf8
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
- latest_repo_baseline: 8972fc5b16ac60583103944776c20761cc4059d2 (`Merge MS8 addendum activation`)
- latest_completed_worktrack: WT-20260528-062 completed and merged before MS8 acceptance; MS8 addendum activation merged at 8972fc5.
- next_worktrack_candidate: WT-20260528-064 after fdch0 answers MS8 addendum clarification questions and explicitly requests worktrack initialization.
- milestone_final_db_readiness_rule: standing rule added by WT-20260528-063; every future Milestone final handback must include active-checkout/active-DATABASE_URL Prisma Client, `prisma validate`, `prisma migrate status`, active DB schema surface, and Prisma-backed API readiness evidence, or an explicit not-applicable reason.
- latest_ms7_validation_report: docs/ms7-final-validation.md
- ms7_acceptance_handback_reopened: 2026-05-28 programmer feedback; zip upload, delete/cleanup, provider manual test record template.
- active_next_milestone: MS-20260528-003 MS8 addendum
- active_milestone_clarification_status: pending fdch0 answers before WT-20260528-064 initialization
- routed_new_requests: AI answer language selection and multiple/split requirement drafts are in MS8; docs path cleanup moved to MS-20260528-002.
- ms8_requirement_confirmation: answered by fdch0; model is multiple knowledge bases with preserved zip paths, selected deletion, AI page multi-knowledge-base selection, language modes `follow input / Chinese / English`, max 3 split drafts via variable, and single selected draft handoff.
- planned_ms8_addendum: MS-20260528-003 registered for knowledge-base edit/disable-archive lifecycle and AI multi-direction clarification.
- planned_next_milestone: MS-20260528-002 docs 文档更新迭代与整理
- remote_ci: GitHub Actions run `26502063963` success for `b5d50b8b8043dc8a35264cf96553955a4697ba8d`
- 分治策略: GitHub CI/远端验证 → 上云边界 → AI MVP 技术决策 → Deepseek discussion MVP → 管理员知识库导入
