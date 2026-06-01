# Milestone Backlog

> Pipeline 中所有 milestone 的注册表，按 priority 排序。

## Pipeline Summary

- total: 16
- planned: 1
- active: 1
- completed: 12
- superseded: 2

## Milestones

### MS-20260523-001

- milestone_id: MS-20260523-001
- title: 项目基本面更新
- milestone_kind: goal-driven
- status: completed
- priority: 1
- depends_on_milestones: []
- worktrack_list: [WT-20260523-001, WT-20260523-002, WT-20260523-003, WT-20260523-004]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-24
- updated_by: harness-kernel
- accepted_by: fdch0
- accepted_at: 2026-05-24

### MS-20260523-002

- milestone_id: MS-20260523-002
- title: 分模块代码质量治理
- milestone_kind: goal-driven
- status: completed
- priority: 2
- depends_on_milestones: [MS-20260523-001]
- worktrack_list: [WT-20260523-005, WT-20260523-006, WT-20260523-007, WT-20260523-008, WT-20260523-009, WT-20260523-010]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-23
- updated_by: harness-kernel

### MS-20260523-003

- milestone_id: MS-20260523-003
- title: API route handler 集成测试
- milestone_kind: goal-driven
- status: completed
- priority: 3
- depends_on_milestones: [MS-20260523-002]
- worktrack_list: [WT-20260523-011, WT-20260523-012, WT-20260523-013, WT-20260523-014, WT-20260523-015]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-23
- updated_by: harness-kernel

### MS-20260524-001

- milestone_id: MS-20260524-001
- title: 项目整洁度与 AI 适配治理
- milestone_kind: goal-driven
- status: completed
- priority: 4
- depends_on_milestones: [MS-20260523-003]
- worktrack_list: [WT-20260524-018, WT-20260524-019, WT-20260524-020, WT-20260524-021, WT-20260524-022, WT-20260524-023, WT-20260524-024]
- created_by: fdch0
- created_at: 2026-05-24
- updated: 2026-05-26
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-26 23:33:49 +08:00

### MS-20260526-001

- milestone_id: MS-20260526-001
- title: GitHub CI 与上云前决策基线
- milestone_kind: goal-driven
- status: completed
- priority: 5
- depends_on_milestones: [MS-20260524-001]
- worktrack_list: [WT-20260526-025, WT-20260526-026, WT-20260526-027, WT-20260526-028, WT-20260526-029, WT-20260526-030, WT-20260526-037, WT-20260526-038]
- created_by: fdch0
- created_at: 2026-05-26
- updated: 2026-05-27
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-27 14:47:38 +08:00

### MS-20260526-002

- milestone_id: MS-20260526-002
- title: AI 需求生成 Discussion MVP
- milestone_kind: goal-driven
- status: completed
- priority: 6
- depends_on_milestones: [MS-20260526-001]
- worktrack_list: [WT-20260526-031, WT-20260526-032, WT-20260526-033, WT-20260526-034, WT-20260526-035, WT-20260526-036, WT-20260527-046, WT-20260527-047]
- created_by: fdch0
- created_at: 2026-05-26
- updated: 2026-05-27
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-27

### MS-20260527-001

- milestone_id: MS-20260527-001
- title: 管理员项目知识库管理与导入
- milestone_kind: goal-driven
- status: completed
- priority: 7
- depends_on_milestones: [MS-20260526-002]
- worktrack_list: [WT-20260527-039, WT-20260527-045, WT-20260527-040, WT-20260527-041, WT-20260527-042, WT-20260527-043, WT-20260527-044, WT-20260528-048, WT-20260528-049, WT-20260528-050, WT-20260528-061, WT-20260528-057]
- created_by: fdch0
- created_at: 2026-05-27
- updated: 2026-05-28
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- acceptance_reopened: 2026-05-28 user upload UI feedback
- pending_addenda: []
- latest_addendum_completed: WT-20260528-050 at a53e00f
- latest_docs_followup_completed: WT-20260528-061 at 8ac2a23
- latest_acceptance_blocker_fix: WT-20260528-057 at 3fd4581
- acceptance_handback_status: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-28
- acceptance_note: accepted after limited manual flow testing; DS API and local OpenAI-compatible API manual validation records remain operator-run checks.

### MS-20260528-001

- milestone_id: MS-20260528-001
- title: 知识库文件夹化管理与模块化 AI 草稿范围
- milestone_kind: goal-driven
- status: completed
- priority: 8
- depends_on_milestones: [MS-20260527-001]
- worktrack_list: [WT-20260528-051, WT-20260528-052, WT-20260528-053, WT-20260528-054, WT-20260528-055, WT-20260528-056, WT-20260528-058, WT-20260528-059, WT-20260528-062]
- created_by: fdch0
- created_at: 2026-05-28
- updated: 2026-05-28
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-28

### MS-20260528-002

- milestone_id: MS-20260528-002
- title: docs 文档更新迭代与整理
- milestone_kind: goal-driven
- status: superseded
- priority: 9
- depends_on_milestones: [MS-20260528-001]
- worktrack_list: [WT-20260528-060]
- created_by: fdch0
- created_at: 2026-05-28
- updated: 2026-05-29
- updated_by: harness-kernel
- superseded_by: MS-11
- superseded_at: 2026-05-29
- origin: deferred from MS8 after programmer confirmation
- purpose: superseded; docs catch-up moved after PostgreSQL hybrid search implementation.

### MS-20260528-003

- milestone_id: MS-20260528-003
- title: MS8 addendum
- milestone_kind: addendum
- status: completed
- priority: 10
- depends_on_milestones: [MS-20260528-001]
- worktrack_list: [WT-20260528-064, WT-20260528-065, WT-20260528-066, WT-20260528-067, WT-20260529-068, WT-20260529-069, WT-20260529-077]
- worktrack_progress: WT-20260528-064=done, WT-20260528-065=done, WT-20260528-066=done, WT-20260528-067=done, WT-20260529-068=done, WT-20260529-069=done, WT-20260529-077=done
- acceptance_handback_status: accepted
- validation_report: docs/ms8-addendum-final-validation.md
- created_by: fdch0
- created_at: 2026-05-28
- updated: 2026-05-29
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- activated_by: fdch0
- activated_at: 2026-05-28
- accepted_by: fdch0
- accepted_at: 2026-05-29
- acceptance_note: accepted after final review; old Chinese retrieval milestone was later superseded by MS-9/MS-10/MS-11.
- purpose: 补齐 MS8 后续的知识库生命周期管理与 AI 多方向追问能力。
- requirement_notes: 知识库采用禁用/归档 + 可编辑；AI 追问至少覆盖知识库角度、应用场景角度和具体需求细节角度；WT-069 根据场景反馈将追问回答改为逐题填写并修复 AI 草稿优先级交接；WT-077 根据场景反馈修复空追问时追问区不可见。

### MS-20260529-001

- milestone_id: MS-20260529-001
- title: 中文知识检索增强与结构化索引
- milestone_kind: goal-driven
- status: superseded
- priority: 11
- depends_on_milestones: [MS-20260528-001]
- recommended_after: MS-20260528-003 final acceptance handback
- worktrack_list: [WT-20260529-070, WT-20260529-071, WT-20260529-072, WT-20260529-073, WT-20260529-074, WT-20260529-075, WT-20260529-076]
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-05-29
- updated_by: harness-kernel
- superseded_by: [MS-9, MS-10, MS-11]
- superseded_at: 2026-05-29
- origin: append-milestone confirmed by fdch0 after Chinese knowledge retrieval recall discussion
- purpose: superseded; lightweight Chinese retrieval scope replaced by PostgreSQL hybrid search.

### MS-9

- milestone_id: MS-9
- title: PostgreSQL 与 Hybrid Search 架构基线
- milestone_kind: goal-driven
- status: completed
- priority: 12
- depends_on_milestones: [MS-20260528-003]
- worktrack_list: [WT-20260529-078, WT-20260529-079, WT-20260529-080, WT-20260529-081, WT-20260529-082, WT-20260531-094, WT-20260531-095, WT-20260531-096]
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-05-31
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- acceptance_handback_status: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-31 17:00:10 +08:00
- acceptance_note: accepted after WT-096 final CodeReview; local validation is sufficient for MS-9 and remote GitHub Actions freshness remains a non-blocking follow-up.
- supersedes: [MS-20260528-002, MS-20260529-001]
- purpose: 建立 PostgreSQL + pgvector + BM25/FTS hybrid search 架构基线、迁移边界、extension readiness 和中文检索评测语料。

### MS-10

- milestone_id: MS-10
- title: 知识库索引与 Hybrid Retrieval 实现
- milestone_kind: goal-driven
- status: completed
- priority: 13
- depends_on_milestones: [MS-9]
- worktrack_list: [WT-20260529-083, WT-20260529-084, WT-20260529-085, WT-20260529-086, WT-20260529-087, WT-20260529-088, WT-20260531-097, WT-20260531-099, WT-20260531-098]
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-05-31
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- activated_by: fdch0
- activated_at: 2026-05-31 17:16:10 +08:00
- acceptance_handback_status: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-31 20:31:00 +08:00
- acceptance_note: accepted after supplemental CodeReview, lexical PostgreSQL FTS fallback repair, local embedding Docker/CPU feasibility assessment, and final local validation.
- purpose: 实现 lexical BM25/FTS、embedding + pgvector、fusion、权限过滤、上下文扩展和可解释 citation。

### MS-11

- milestone_id: MS-11
- title: AI 草稿 Hybrid Context 接入与文档追平
- milestone_kind: goal-driven
- status: completed
- priority: 14
- depends_on_milestones: [MS-10]
- worktrack_list: [WT-20260529-089, WT-20260529-090, WT-20260529-091, WT-20260529-092, WT-20260529-093, WT-20260531-100]
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-06-01
- updated_by: codex
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- activated_by: fdch0
- activated_at: 2026-05-31 22:19:42 +08:00
- acceptance_handback_status: accepted
- accepted_by: fdch0
- accepted_at: 2026-06-01
- acceptance_note: accepted after all 6/6 MS-11 worktracks completed, local validation passed, docs/operator catch-up completed, and local CPU embedding sidecar PoC was verified.
- worktrack_progress: WT-20260529-089=done, WT-20260529-090=done, WT-20260529-091=done, WT-20260529-092=done, WT-20260529-093=done, WT-20260531-100=done
- purpose: 接入 AI draft hybrid context，完成中文业务端到端验收、PostgreSQL/extension readiness 和 docs/operator 文档追平。

### MS-12

- milestone_id: MS-12
- title: AI 需求追问质量升级与 Business Interrogation
- milestone_kind: goal-driven
- status: active
- priority: 15
- depends_on_milestones: [MS-11]
- worktrack_list: [WT-20260601-101, WT-20260601-114, WT-20260601-102, WT-20260601-103, WT-20260601-104, WT-20260601-105, WT-20260601-106, WT-20260601-107]
- created_by: fdch0
- created_at: 2026-06-01
- updated: 2026-06-01
- updated_by: codex
- activation_rules: current_active_milestone == none and depends_on_milestones completed/accepted
- activated_by: fdch0
- activated_at: 2026-06-01
- worktrack_progress: WT-20260601-101=done, WT-20260601-114=done, WT-20260601-102=done, WT-20260601-103=done, WT-20260601-104=planned, WT-20260601-105=planned, WT-20260601-106=planned, WT-20260601-107=planned
- purpose: 将 AI 追问从普通澄清升级为 coverage-aware business interrogation，能发现知识库覆盖缺口、流程矛盾、例外规则、责任边界、异常分支和验收风险。

### MS-13

- milestone_id: MS-13
- title: Docker Compose Runtime Bundle 与本地一键运行
- milestone_kind: goal-driven
- status: planned
- priority: 16
- depends_on_milestones: [MS-12]
- worktrack_list: [WT-20260601-108, WT-20260601-109, WT-20260601-110, WT-20260601-111, WT-20260601-112, WT-20260601-113]
- created_by: fdch0
- created_at: 2026-06-01
- updated: 2026-06-01
- updated_by: codex
- activation_rules: current_active_milestone == none and depends_on_milestones completed/accepted
- purpose: 提供 web + PostgreSQL/pgvector + optional embedding sidecar 的 Docker Compose runtime bundle、readiness/probe 编排和 operator runbook；不把模型权重打进主 app image。
