# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-05-31
- owner: fdch0

## Current Control Level

- repo_scope: inactive
- worktrack_scope: judging

## Active Worktrack

- active_worktrack: WT-20260529-083
- worktrack_title: Knowledge search index schema、SearchIndexProfile 与 metadata migration
- worktrack_status: gate-passed
- target_milestone_id: MS-10

## Active Milestone

- active_milestone: MS-10
- milestone_title: 知识库索引与 Hybrid Retrieval 实现
- milestone_status: active
- milestone_pipeline_summary: total=14 planned=1 active=1 completed=10 superseded=2; MS-20260528-002 and MS-20260529-001 superseded by MS-9/MS-10/MS-11

## Baseline Branch

- baseline_branch: develop

## Current Next Action

- WT-20260529-083 gate passed. Close and merge next.

## Linked Formal Documents

- repo_snapshot: .servo/repo/snapshot-status.md
- repo_analysis: .servo/repo/analysis.md
- worktrack_contract: .servo/worktrack/WT-20260529-083/contract.md
- plan_task_queue: .servo/worktrack/WT-20260529-083/plan-task-queue.md
- gate_evidence: .servo/worktrack/WT-20260529-083/gate-evidence.md
- milestone_backlog: .servo/repo/milestone-backlog.md
- worktrack_backlog: .servo/repo/worktrack-backlog.md

## Approval Boundary

- needs_programmer_approval: false
- reason: fdch0 explicitly activated MS-10 and granted 30 continuous Worktrack actions for this execution cycle.
- approval_scope: MS-10 active milestone worktracks; dangerous operations, destructive deletion, system configuration changes, context-loss signals, and developer decisions still require handback.
- approval_persistence: active for MS-10 execution cycle until interrupted or milestone final acceptance handback.

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
- persistent_authority_notes: 用户在 2026-05-28 明确授予 MS8 addendum 执行周期 30 个连续 Worktrack 额度，允许 SubAgent、低危险 Worktrack 自审批、连续工作、严格验收、必要时自动新增并执行 Worktrack；危险操作、上下文噪声明显或需要用户业务判断时必须 handback；MS8 addendum milestone final acceptance 必须由用户决定。

## Handback Guard

- handoff_state: unlocked_ms10_execution
- last_stop_reason: none
- last_handback_signature: ms10-activated::2026-05-31::6-worktracks
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: fdch0 explicitly activated MS-10 and approved 30 continuous Worktrack actions on 2026-05-31.

## Baseline Traceability

- last_verified_checkpoint: 629f7c7232e425d08484877593222cbeaec2ec1f
- latest_observed_checkpoint: a2a3338248a64afc54997920e9e51a164858a834
- last_doc_catch_up_checkpoint: 8ac2a235bde15e2698be1f9bffa55b13f38c0805
- milestone_input_checkpoint: sha256:5cabd918ab388c51fc3abb0f97d413179caf0d90b15d9f666afa7551ce9ea625
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-05-31
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 30
- autonomous_worktracks_opened: 0
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-05-31
- autonomy_budget_notes: MS-10 执行周期授权；允许 SubAgent、低危险 Worktrack 自审批、连续工作、严格验收、必要时自动新增并执行 Worktrack。危险操作、大量文件删除、系统配置修改、上下文噪声明显或需要用户业务判断时必须 handback。Milestone final acceptance 必须由 fdch0 决定。

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- Phase 9 上一阶段: M3 API route handler 集成测试已验收
- Phase 9 当前阶段: MS-20260527-001 管理员知识库管理与导入已完成 12/12 worktracks，并由用户在 2026-05-28 最终验收。
- latest_acceptance: MS-9 accepted by fdch0 on 2026-05-31 after WT-096 final CodeReview
- latest_repo_baseline: ce47388bff033383146971b225fb81a7a0ddab11 (`Record WT-082 closeout baseline`)
- latest_completed_worktrack: WT-20260529-077 completed and merged at 06544725d0de8c5ff62cf771fd61fb0b8d039b2c before MS8 addendum final acceptance.
- next_worktrack_candidate: WT-20260529-083 initialized; dispatch implementation next.
- latest_completed_ms8_addendum_worktrack: WT-20260528-064 completed and merged at 7ece1b8cb8c9d77f1f04fac59eac52fe897ab14d; gate evidence `.servo/worktrack/WT-20260528-064/gate-evidence.md`.
- latest_completed_ms8_addendum_worktrack: WT-20260528-065 completed and merged at 5198bc9f7a493a36bf9e0c5df8fe9872476715eb; gate evidence `.servo/worktrack/WT-20260528-065/gate-evidence.md`.
- latest_completed_ms8_addendum_worktrack: WT-20260528-066 completed and merged at dc0e98a2bb30f1a7f502ae854b33b5bb4152217b; final validation report `docs/ms8-addendum-final-validation.md`; awaiting fdch0 final acceptance.
- latest_completed_ms8_addendum_worktrack: WT-20260528-067 completed and merged at ceada20bbf09f689d6ed1e8ecd8dc3a0290a988c; admin knowledge-base create entry fixed after fdch0 acceptance feedback.
- latest_completed_ms8_addendum_worktrack: WT-20260529-068 completed and merged at c877c51174377a258b16248deedbc373a3758e72; docs-codewiki zip sidecar compatibility added after fdch0 scenario feedback.
- latest_completed_ms8_addendum_worktrack: WT-20260529-069 completed and merged at 551df3df51948f674c39f9b4de4c89b83df9bb3b; AI clarification now supports per-question answers and AI draft priority handoff is normalized.
- latest_completed_ms8_addendum_worktrack: WT-20260529-077 completed and merged at 06544725d0de8c5ff62cf771fd61fb0b8d039b2c; AI clarification area remains visible when provider returns empty questions and uses fallback direction questions.
- milestone_final_db_readiness_rule: standing rule added by WT-20260528-063; every future Milestone final handback must include active-checkout/active-DATABASE_URL Prisma Client, `prisma validate`, `prisma migrate status`, active DB schema surface, and Prisma-backed API readiness evidence, or an explicit not-applicable reason.
- latest_ms7_validation_report: docs/ms7-final-validation.md
- ms7_acceptance_handback_reopened: 2026-05-28 programmer feedback; zip upload, delete/cleanup, provider manual test record template.
- active_next_milestone: MS-10 知识库索引与 Hybrid Retrieval 实现.
- active_milestone_clarification_status: confirmed; fdch0 activated MS-10 on 2026-05-31 and approved 30 continuous Worktrack actions.
- routed_new_requests: PostgreSQL hybrid search replaces previous docs cleanup and lightweight Chinese retrieval plans.
- ms8_requirement_confirmation: answered by fdch0; model is multiple knowledge bases with preserved zip paths, selected deletion, AI page multi-knowledge-base selection, language modes `follow input / Chinese / English`, max 3 split drafts via variable, and single selected draft handoff.
- planned_ms8_addendum: MS-20260528-003 registered for knowledge-base edit/disable-archive lifecycle and AI multi-direction clarification.
- superseded_milestones: MS-20260528-002 docs 文档更新迭代与整理; MS-20260529-001 中文知识检索增强与结构化索引.
- current_active_milestone: MS-10 知识库索引与 Hybrid Retrieval 实现
- planned_followup_milestones: MS-10 知识库索引与 Hybrid Retrieval 实现; MS-11 AI 草稿 Hybrid Context 接入与文档追平
- embedding_profile_decision: Embedding provider is separate from AI chat provider; active SearchIndexProfile locks model/dimensions/semantic space and any model/dimension change requires explicit reindex.
- hybrid_search_planning_addendum: Follow-up design points folded into MS-9/MS-10/MS-11: query understanding, structured metadata indexing, RRF fusion, optional reranker seam, context window builder, retrieval evaluation harness, admin/debug evidence, pgvector filtered-search risk boundary.
- remote_ci: GitHub Actions run `26502063963` success for `b5d50b8b8043dc8a35264cf96553955a4697ba8d`
- 分治策略: GitHub CI/远端验证 → 上云边界 → AI MVP 技术决策 → Deepseek discussion MVP → 管理员知识库导入
