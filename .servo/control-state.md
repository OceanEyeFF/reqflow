# Harness Control State

> 维护当前 Harness supervisor 的控制面状态，不写入业务真相。

## Metadata

- updated: 2026-06-01
- owner: fdch0

## Current Control Level

- repo_scope: scheduling
- worktrack_scope: closed

## Active Worktrack

- active_worktrack: WT-20260601-130
- worktrack_title: App retrieval integration impact and expected product benefit
- worktrack_status: closed
- target_milestone_id: MS-16

## Active Milestone

- active_milestone: MS-16
- milestone_title: PostgreSQL Runtime Selection Review and ParadeDB Default Switch Decision
- milestone_status: active
- milestone_pipeline_summary: total=19 planned=0 active=1 completed=16 superseded=2; MS-16 activated after fdch0 accepted MS-15 and requested runtime option selection review

## Baseline Branch

- baseline_branch: develop

## Current Next Action

- WT-20260601-130 completed the app retrieval integration impact and expected product benefit estimate. Next action is initialize WT-20260601-131 to synthesize the runtime selection ADR and fdch0 decision gate; no default ParadeDB runtime switch has been made.

## Linked Formal Documents

- repo_snapshot: .servo/repo/snapshot-status.md
- repo_analysis: .servo/repo/analysis.md
- worktrack_contract: .servo/worktrack/WT-20260601-130/contract.md
- plan_task_queue: .servo/worktrack/WT-20260601-130/plan-task-queue.md
- gate_evidence: .servo/worktrack/WT-20260601-130/gate-evidence.md
- milestone_backlog: .servo/repo/milestone-backlog.md
- worktrack_backlog: .servo/repo/worktrack-backlog.md

## Approval Boundary

- needs_programmer_approval: true
- reason: fdch0 granted a 30-Worktrack continuous MS-16 execution budget on 2026-06-02, including SubAgent use, low-risk Worktrack self-approval, continuous work, strict validation, and automatic backlog expansion when needed; dangerous operations, obvious context noise, and fdch0 decision points still require handback.
- approval_scope: MS-16 runtime-selection Worktracks and low-risk follow-up Worktracks within the same milestone. Dangerous operations, destructive deletion, system configuration changes, context-loss signals, runtime default switch implementation, volume/data migration, production/deployment choices, and final milestone acceptance require fdch0 handback.
- approval_persistence: persistent for this MS-16 execution cycle until 30 Worktrack budget is consumed or a stop condition is hit.

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
- persistent_authority_notes: 用户在 2026-06-02 明确授予 MS-16 执行周期 30 个连续 Worktrack 额度，允许 SubAgent、低危险 Worktrack 自审批、连续工作、严格验收、必要时自动新增并执行 Worktrack；危险操作、上下文噪声明显或需要用户业务判断时必须 handback；MS-16 milestone final acceptance 必须由用户决定。

## Handback Guard

- handoff_state: repo_scope_observing_after_ms11_acceptance
- last_stop_reason: MS-11 final acceptance completed
- last_handback_signature: ms11-accepted::2026-06-01::6-worktracks
- handback_reaffirmed_rounds: 0
- stable_handback_threshold: 2
- handback_lock_active: false
- last_unlock_signal: fdch0 accepted MS-11 final handback and requested context-noise assessment before MS-12 activation on 2026-06-01.

## Baseline Traceability

- last_verified_checkpoint: e7c1e61243e81d4ba24132497299225290c5da92
- latest_observed_checkpoint: e7c1e61243e81d4ba24132497299225290c5da92
- last_doc_catch_up_checkpoint: 38da2ba
- milestone_input_checkpoint: sha256:5cabd918ab388c51fc3abb0f97d413179caf0d90b15d9f666afa7551ce9ea625
- checkpoint_type: git-commit
- checkpoint_ref: develop
- verified_at: 2026-06-02
- if_no_commit_reason:
- alternative_traceability:

## Autonomy Ledger

- autonomy_budget_remaining: 28
- autonomous_worktracks_opened: 2
- autonomy_budget_granted_by: fdch0
- autonomy_budget_granted_at: 2026-06-02
- autonomy_budget_notes: MS-16 received a 30-Worktrack continuous execution budget on 2026-06-02. WT-20260601-129 and WT-20260601-130 consumed two budget units in this execution cycle. Final milestone acceptance remains fdch0-only.

## Notes

- returning_to_repo_scope_does_not_clear_handoff: yes
- Phase 1-8 已完成，Phase 9 代码质量治理阶段开始
- Phase 9 上一阶段: M3 API route handler 集成测试已验收
- Phase 9 当前阶段: MS-20260527-001 管理员知识库管理与导入已完成 12/12 worktracks，并由用户在 2026-05-28 最终验收。
- latest_acceptance: MS-9 accepted by fdch0 on 2026-05-31 after WT-096 final CodeReview
- latest_acceptance: MS-10 accepted by fdch0 on 2026-05-31 after WT-097 final CodeReview, WT-099 lexical FTS repair, and WT-098 local embedding Docker/CPU feasibility assessment.
- latest_acceptance: MS-11 accepted by fdch0 on 2026-06-01 after all 6/6 worktracks completed, docs/operator catch-up, PostgreSQL/extension readiness, Chinese business E2E validation, and local CPU embedding sidecar PoC.
- latest_acceptance: MS-12 accepted by fdch0 on 2026-06-01 after all 8/8 worktracks completed, Playwright smoke passed, direct embedding environment tests passed, local sidecar indexing trial passed, and pg_search unavailable cause was recorded as a runtime image packaging boundary.
- latest_acceptance: MS-13 accepted by fdch0 on 2026-06-01 after Docker runtime final validation and CodeReview; web + PostgreSQL/pgvector compose runtime smoke passed, native FTS fallback remained explicit, and no destructive volume/cache cleanup was used.
- latest_acceptance: MS-14 accepted by fdch0 on 2026-06-01 after all 8/8 worktracks completed; final decision report recommends ParadeDB `pg_search` only as a future runtime-enablement candidate, defers VectorChord-BM25 and `pg_textsearch`, and keeps default runtime unchanged.
- latest_acceptance: MS-15 accepted by fdch0 on 2026-06-01 after all 5/5 worktracks completed; ParadeDB `pg_search` candidate runtime passed compose, Prisma/app smoke, strict extension readiness, Chinese BM25 benchmark, hybrid invariant comparison, and rollback/runbook documentation; default runtime switch remains deferred and no production migration was performed.
- active_milestone_init: MS-16 activated on 2026-06-01 for PostgreSQL runtime selection review and ParadeDB default-switch decision gate.
- latest_completed_ms16_worktrack: WT-20260601-128 completed with decision model `docs/ms16-runtime-path-cost-benefit-model.md`; gate evidence `.servo/worktrack/WT-20260601-128/gate-evidence.md`; no runtime switch, no compose default change, no data migration.
- latest_completed_ms16_worktrack: WT-20260601-129 completed with migration/rollback cost report `docs/ms16-paradedb-default-migration-rollback-cost.md`; gate evidence `.servo/worktrack/WT-20260601-129/gate-evidence.md`; recommended fresh ParadeDB volume for pre-production if selected, rejected direct PostgreSQL 16 volume reuse, and preserved fdch0 decision boundary.
- latest_completed_ms16_worktrack: WT-20260601-130 completed with app retrieval integration impact report `docs/ms16-app-retrieval-integration-impact.md`; gate evidence `.servo/worktrack/WT-20260601-130/gate-evidence.md`; product benefit requires a later app lexical adapter and retrieval gates before any BM25 app-behavior claim.
- latest_repo_baseline: ce47388bff033383146971b225fb81a7a0ddab11 (`Record WT-082 closeout baseline`)
- latest_completed_worktrack: WT-20260529-077 completed and merged at 06544725d0de8c5ff62cf771fd61fb0b8d039b2c before MS8 addendum final acceptance.
- latest_completed_ms10_worktrack: WT-20260529-085 completed and validated at 02c7ea2bdfb48ed06be424a30c1785b897a0978b; gate evidence `.servo/worktrack/WT-20260529-085/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260529-086 completed and validated at 7374e990a30fc3290e1ca47eb32e290bc5ff9e09; gate evidence `.servo/worktrack/WT-20260529-086/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260529-087 completed and validated at a9ddffde65c12b20e778caaaf8f5531c13114912; gate evidence `.servo/worktrack/WT-20260529-087/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260529-088 completed and validated at ede02348c95cfabfd50598367b934f9618de37f4; gate evidence `.servo/worktrack/WT-20260529-088/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260531-097 completed with blocker finding at 23a65042db4a96d96e59f10f6775f6379e66095f; gate evidence `.servo/worktrack/WT-20260531-097/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260531-099 completed and validated at 66f44c886498bd3c531f4dfe8dd74558a5dfbbce; gate evidence `.servo/worktrack/WT-20260531-099/gate-evidence.md`.
- latest_completed_ms10_worktrack: WT-20260531-098 completed and validated at c0bbf36b3a2626fe6252d7421f410923c3186ab4; gate evidence `.servo/worktrack/WT-20260531-098/gate-evidence.md`.
- latest_completed_ms11_worktrack: WT-20260529-090 completed and merged at 59e37669bdb51146563c749fbbdf1f1cbbf995e6; gate evidence `.servo/worktrack/WT-20260529-090/gate-evidence.md`.
- latest_completed_ms11_worktrack: WT-20260529-091 completed and merged at 27d57651aa1325fb394a548134dc7f944ec6f945; gate evidence `.servo/worktrack/WT-20260529-091/gate-evidence.md`.
- latest_completed_ms11_worktrack: WT-20260529-092 completed and merged at ea55f10de52ab307ceb36f4b5e4b688cb5873fe8; gate evidence `.servo/worktrack/WT-20260529-092/gate-evidence.md`.
- latest_completed_ms11_worktrack: WT-20260529-093 completed and merged at 38da2ba; gate evidence `.servo/worktrack/WT-20260529-093/gate-evidence.md`.
- latest_completed_ms11_worktrack: WT-20260531-100 completed and merged at 5c8897c; gate evidence `.servo/worktrack/WT-20260531-100/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-114 completed and merged at 2c642c1; gate evidence `.servo/worktrack/WT-20260601-114/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-101 completed and merged at 486ff25; gate evidence `.servo/worktrack/WT-20260601-101/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-102 completed and merged at 7d9b680; gate evidence `.servo/worktrack/WT-20260601-102/gate-evidence.md`; pg_search remains unavailable in current local image and native FTS fallback is required.
- latest_completed_ms12_worktrack: WT-20260601-103 completed and merged at a723c8a; gate evidence `.servo/worktrack/WT-20260601-103/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-104 completed and merged at 0ee02bb; gate evidence `.servo/worktrack/WT-20260601-104/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-105 completed and merged at 4965a55; gate evidence `.servo/worktrack/WT-20260601-105/gate-evidence.md`.
- latest_completed_ms12_worktrack: WT-20260601-106 completed and merged at 023912f; gate evidence `.servo/worktrack/WT-20260601-106/gate-evidence.md`; `npm run clarification:golden` added for the consumables golden case.
- latest_completed_ms12_worktrack: WT-20260601-107 completed with local HTTP embedding sidecar -> temporary DB schema -> pgvector -> hybrid retrieval evidence; gate evidence `.servo/worktrack/WT-20260601-107/gate-evidence.md`; `npm run embedding:indexing-trial` added for explicit local sidecar indexing validation.
- latest_completed_ms13_worktrack: WT-20260601-108 completed and merged at 47e0c79; gate evidence `.servo/worktrack/WT-20260601-108/gate-evidence.md`; web Dockerfile, standalone output, runtime env contract, Docker build, image content probe, non-root runtime, OpenSSL/Prisma engine probe, and standalone startup probe passed.
- latest_completed_ms13_worktrack: WT-20260601-109 completed and merged at 1e7af35; gate evidence `.servo/worktrack/WT-20260601-109/gate-evidence.md`; compose runtime config, embedding profile gating, web image build, non-destructive command scan, and compose startup smoke passed with alternate local ports.
- latest_completed_ms13_worktrack: WT-20260601-110 completed and merged at 45a1372; gate evidence `.servo/worktrack/WT-20260601-110/gate-evidence.md`; `npm run runtime:smoke` added and validated against compose runtime with migrate deploy, readiness, search extension checks, web HTTP smoke, and non-destructive boundaries.
- latest_completed_ms13_worktrack: WT-20260601-111 completed and merged at ccf283f; gate evidence `.servo/worktrack/WT-20260601-111/gate-evidence.md`; BM25 candidates documented, readiness candidate detection added, default runtime kept on native FTS fallback plus pgvector.
- latest_completed_ms13_worktrack: WT-20260601-112 completed and merged at b9c6ed7; gate evidence `.servo/worktrack/WT-20260601-112/gate-evidence.md`; operator runtime runbook added, stale handoff refreshed, Docker build fallback repaired with `npm run build:webpack`, and runtime smoke passed on alternate local ports without deleting volumes/cache.
- latest_completed_ms13_worktrack: WT-20260601-113 completed and merged at 438cba9; gate evidence `.servo/worktrack/WT-20260601-113/gate-evidence.md`; final validation report `docs/ms13-final-validation.md`; lint/test/build/compose/runtime smoke passed and MS-13 is ready for fdch0 final acceptance review.
- latest_completed_ms14_worktrack: WT-20260601-115 completed and merged at ce99c5f; gate evidence `.servo/worktrack/WT-20260601-115/gate-evidence.md`; candidate matrix `docs/ms14-bm25-candidate-matrix.md` defines BM25 plugin candidates, Chinese evaluation plan, compatibility gates, and non-claim boundaries.
- latest_completed_ms14_worktrack: WT-20260601-116 completed and merged at a15a6b9; gate evidence `.servo/worktrack/WT-20260601-116/gate-evidence.md`; `npm run bm25:evaluate` validates the MS-14 Chinese BM25 benchmark corpus and result contract.
- latest_completed_ms14_worktrack: WT-20260601-117 completed and merged at f3bf8b0; gate evidence `.servo/worktrack/WT-20260601-117/gate-evidence.md`; ParadeDB `pg_search` passed isolated runtime and Chinese benchmark gates as a future runtime candidate with caveats.
- latest_completed_ms14_worktrack: WT-20260601-118 completed and merged at af4fe95; gate evidence `.servo/worktrack/WT-20260601-118/gate-evidence.md`; VectorChord-BM25 / `pg_tokenizer` runtime compatibility passed but candidate decision is defer due to synonym Recall@5 gate failure.
- latest_completed_ms14_worktrack: WT-20260601-119 completed and merged at c1d5f7c; gate evidence `.servo/worktrack/WT-20260601-119/gate-evidence.md`; `pg_textsearch` candidate decision is defer because the tested PostgreSQL 18 image does not expose the extension.
- latest_completed_ms14_worktrack: WT-20260601-120 completed and merged at 6b304a8; gate evidence `.servo/worktrack/WT-20260601-120/gate-evidence.md`; tokenizer synthesis report `docs/ms14-chinese-tokenization-evaluation.md`; ParadeDB is the strongest measured ranking-compatible BM25 candidate so far with tokenizer caveats, VectorChord remains deferred due to synonym Recall@5/token-audit caveats, and `pg_textsearch` remains unavailable in tested runtime.
- latest_completed_ms14_worktrack: WT-20260601-121 completed and merged at 55a19fd; gate evidence `.servo/worktrack/WT-20260601-121/gate-evidence.md`; comparison report `docs/ms14-bm25-accuracy-performance-comparison.md`; ParadeDB passed MS-14 result gate, VectorChord remains deferred due to synonym Recall@5, native FTS remains fixture/control evidence, and hybrid evidence remains MS-10 architecture evidence rather than same-corpus performance evidence.
- latest_completed_ms14_worktrack: WT-20260601-122 completed and merged at 17c8139; gate evidence `.servo/worktrack/WT-20260601-122/gate-evidence.md`; final decision report `docs/ms14-final-decision-report.md`; ParadeDB `pg_search` is adopted only as a future runtime-enablement candidate, VectorChord-BM25 and `pg_textsearch` are deferred, default runtime remains native PostgreSQL FTS fallback plus pgvector, and MS-14 is ready for fdch0 acceptance review.
- latest_completed_ms15_worktrack: WT-20260601-123 completed and merged at 91fd071; gate evidence `.servo/worktrack/WT-20260601-123/gate-evidence.md`; isolated ParadeDB candidate compose `docker-compose.paradedb.yml` and design doc `docs/ms15-paradedb-runtime-design.md` added without changing default runtime.
- latest_completed_ms15_worktrack: WT-20260601-124 completed and merged at b367011; gate evidence `.servo/worktrack/WT-20260601-124/gate-evidence.md`; ParadeDB candidate runtime passed compose config, Prisma migrate deploy, seed, readiness, strict pg_search readiness, web HTTP smoke, lint/test/build, and non-destructive stop; `pg_search` 0.23.5 and `vector` 0.8.1 coexist on PostgreSQL 18.4.
- latest_completed_ms15_worktrack: WT-20260601-125 completed and merged at 4aea964; gate evidence `.servo/worktrack/WT-20260601-125/gate-evidence.md`; candidate compose pg_search benchmark passed the MS-14 Chinese corpus gate with ParadeDB custom scan EXPLAIN evidence and `pdb.unicode default` tokenizer caveat.
- latest_completed_ms15_worktrack: WT-20260601-126 completed and merged at 4e1dbfc; gate evidence `.servo/worktrack/WT-20260601-126/gate-evidence.md`; same-corpus lexical comparison and separate hybrid invariant evidence passed without claiming app-level ParadeDB hybrid performance.
- latest_completed_ms15_worktrack: WT-20260601-127 completed and merged at d28a7ac; gate evidence `.servo/worktrack/WT-20260601-127/gate-evidence.md`; final report `docs/ms15-final-decision-report.md` recommends deferring default runtime switch while approving ParadeDB as the next implementation candidate.
- next_worktrack_candidate: WT-20260601-131 Runtime selection ADR and fdch0 decision gate.
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
- active_next_milestone: MS-16 PostgreSQL Runtime Selection Review and ParadeDB Default Switch Decision.
- active_milestone_clarification_status: MS-12 accepted by fdch0 on 2026-06-01 after WT-20260601-101, WT-20260601-114, WT-20260601-102, WT-20260601-103, WT-20260601-104, WT-20260601-105, WT-20260601-106, and WT-20260601-107 completed.
- routed_new_requests: PostgreSQL hybrid search replaces previous docs cleanup and lightweight Chinese retrieval plans.
- ms8_requirement_confirmation: answered by fdch0; model is multiple knowledge bases with preserved zip paths, selected deletion, AI page multi-knowledge-base selection, language modes `follow input / Chinese / English`, max 3 split drafts via variable, and single selected draft handoff.
- planned_ms8_addendum: MS-20260528-003 registered for knowledge-base edit/disable-archive lifecycle and AI multi-direction clarification.
- superseded_milestones: MS-20260528-002 docs 文档更新迭代与整理; MS-20260529-001 中文知识检索增强与结构化索引.
- current_active_milestone: MS-16 PostgreSQL Runtime Selection Review and ParadeDB Default Switch Decision.
- latest_completed_milestone: MS-15 ParadeDB `pg_search` Runtime Replacement Validation accepted by fdch0 on 2026-06-01.
- planned_followup_milestones: none; MS-16 will decide whether a ParadeDB default-runtime implementation milestone should be created.
- bm25_planning_update: BM25/pg_search support is planned as MS-12 readiness/design plus MS-13 runtime-image feasibility/fallback packaging; it must not be claimed as active runtime behavior until target Docker/PostgreSQL environment readiness passes.
- business_interrogation_planning_update: MS-12 is planned to upgrade AI clarify from generic questions to coverage-aware business interrogation with high-value question categories, blocking priority, evidence basis, UI grouping, and the consumables outbound-inspection golden case.
- context_noise_assessment: high for MS-12 implementation; this window is acceptable for MS-12 control-plane activation or handoff planning, but actual WT-20260601-101+ execution should preferably start in a fresh window using .servo/control-state.md, .servo/milestone/MS-12.md, and .servo/repo/worktrack-backlog.md as canonical context.
- embedding_profile_decision: Embedding provider is separate from AI chat provider; active SearchIndexProfile locks model/dimensions/semantic space and any model/dimension change requires explicit reindex.
- hybrid_search_planning_addendum: Follow-up design points folded into MS-9/MS-10/MS-11: query understanding, structured metadata indexing, RRF fusion, optional reranker seam, context window builder, retrieval evaluation harness, admin/debug evidence, pgvector filtered-search risk boundary.
- remote_ci: GitHub Actions run `26502063963` success for `b5d50b8b8043dc8a35264cf96553955a4697ba8d`
- 分治策略: GitHub CI/远端验证 → 上云边界 → AI MVP 技术决策 → Deepseek discussion MVP → 管理员知识库导入
