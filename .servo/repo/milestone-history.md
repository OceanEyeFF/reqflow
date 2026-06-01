# Milestone History

> 已完成或已验收 milestone 的历史索引。业务真相仍以各 `.servo/milestone/*.md` artifact 为准。

## Summary

- total: 19
- completed: 17
- superseded: 2

## Completed Milestones

### MS-20260523-001

- milestone_id: MS-20260523-001
- title: 项目基本面更新
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-24
- source_artifact: .servo/milestone/MS-20260523-001.md

### MS-20260523-002

- milestone_id: MS-20260523-002
- title: 分模块代码质量治理
- status: completed
- accepted_by: N/A
- accepted_at: N/A
- source_artifact: .servo/milestone/MS-20260523-002.md

### MS-20260523-003

- milestone_id: MS-20260523-003
- title: API route handler 集成测试
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-24
- source_artifact: .servo/milestone/MS-20260523-003.md

### MS-20260524-001

- milestone_id: MS-20260524-001
- title: 项目整洁度与 AI 适配治理
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-26 23:33:49 +08:00
- source_artifact: .servo/milestone/MS-20260524-001.md

### MS-20260526-001

- milestone_id: MS-20260526-001
- title: GitHub CI 与上云前决策基线
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-27 14:47:38 +08:00
- source_artifact: .servo/milestone/MS-20260526-001.md

### MS-20260526-002

- milestone_id: MS-20260526-002
- title: AI 需求生成 Discussion MVP
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-27
- source_artifact: .servo/milestone/MS-20260526-002.md

### MS-20260527-001

- milestone_id: MS-20260527-001
- title: 管理员项目知识库管理与导入
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-28
- source_artifact: .servo/milestone/MS-20260527-001.md
- completed_worktracks: WT-20260527-039, WT-20260527-045, WT-20260527-040, WT-20260527-041, WT-20260527-042, WT-20260527-043, WT-20260527-044, WT-20260528-048, WT-20260528-049, WT-20260528-050, WT-20260528-061, WT-20260528-057
- acceptance_note: accepted after limited manual flow testing; DS API and local OpenAI-compatible API manual validation records remain operator-run checks.

### MS-20260528-001

- milestone_id: MS-20260528-001
- title: 知识库文件夹化管理与模块化 AI 草稿范围
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-28
- source_artifact: .servo/milestone/MS-20260528-001.md
- completed_worktracks: WT-20260528-051, WT-20260528-052, WT-20260528-053, WT-20260528-054, WT-20260528-055, WT-20260528-056, WT-20260528-058, WT-20260528-059, WT-20260528-062
- acceptance_note: accepted by fdch0 after WT-20260528-062 completed active-checkout Prisma/database readiness validation.

### MS-20260528-003

- milestone_id: MS-20260528-003
- title: MS8 addendum
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-29
- source_artifact: .servo/milestone/MS-20260528-003.md
- completed_worktracks: WT-20260528-064, WT-20260528-065, WT-20260528-066, WT-20260528-067, WT-20260529-068, WT-20260529-069, WT-20260529-077
- acceptance_note: accepted after final review; Chinese knowledge retrieval improvements were registered separately as MS-20260529-001.

### MS-9

- milestone_id: MS-9
- title: PostgreSQL 与 Hybrid Search 架构基线
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-31 17:00:10 +08:00
- source_artifact: .servo/milestone/MS-9.md
- completed_worktracks: WT-20260529-078, WT-20260529-079, WT-20260529-080, WT-20260529-081, WT-20260529-082, WT-20260531-094, WT-20260531-095, WT-20260531-096
- acceptance_note: accepted after WT-096 final CodeReview; local validation is sufficient for MS-9 and remote GitHub Actions freshness remains a non-blocking follow-up.

### MS-10

- milestone_id: MS-10
- title: 知识库索引与 Hybrid Retrieval 实现
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-05-31 20:31:00 +08:00
- source_artifact: .servo/milestone/MS-10.md
- completed_worktracks: WT-20260529-083, WT-20260529-084, WT-20260529-085, WT-20260529-086, WT-20260529-087, WT-20260529-088, WT-20260531-097, WT-20260531-099, WT-20260531-098
- acceptance_note: accepted after supplemental CodeReview, lexical PostgreSQL FTS fallback repair, local embedding Docker/CPU feasibility assessment, and final local validation.

### MS-11

- milestone_id: MS-11
- title: AI 草稿 Hybrid Context 接入与文档追平
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-06-01
- source_artifact: .servo/milestone/MS-11.md
- completed_worktracks: WT-20260529-089, WT-20260529-090, WT-20260529-091, WT-20260529-092, WT-20260529-093, WT-20260531-100
- acceptance_note: accepted after all 6/6 MS-11 worktracks completed, local AI draft hybrid context validation passed, Chinese business E2E evidence and PostgreSQL/extension readiness were recorded, docs/operator catch-up completed, and local CPU embedding sidecar PoC was verified.

### MS-12

- milestone_id: MS-12
- title: AI 需求追问质量升级与 Business Interrogation
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-06-01
- source_artifact: .servo/milestone/MS-12.md
- completed_worktracks: WT-20260601-101, WT-20260601-114, WT-20260601-102, WT-20260601-103, WT-20260601-104, WT-20260601-105, WT-20260601-106, WT-20260601-107
- acceptance_note: accepted after all 8/8 worktracks completed, Playwright smoke passed, direct embedding environment tests passed, local sidecar indexing trial passed, and pg_search unavailable cause was recorded as a runtime image packaging boundary.

### MS-13

- milestone_id: MS-13
- title: Docker Compose Runtime Bundle 与本地一键运行
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-06-01
- source_artifact: .servo/milestone/MS-13.md
- completed_worktracks: WT-20260601-108, WT-20260601-109, WT-20260601-110, WT-20260601-111, WT-20260601-112, WT-20260601-113
- acceptance_note: accepted after Docker runtime final validation and CodeReview; runtime smoke passed with web + PostgreSQL/pgvector, native FTS fallback, explicit migrate/seed/readiness, and non-destructive stop.

### MS-14

- milestone_id: MS-14
- title: PostgreSQL BM25 插件中文兼容与性能准确率评估
- status: completed
- accepted_by: fdch0
- accepted_at: 2026-06-01
- source_artifact: .servo/milestone/MS-14.md
- completed_worktracks: WT-20260601-115, WT-20260601-116, WT-20260601-117, WT-20260601-118, WT-20260601-119, WT-20260601-120, WT-20260601-121, WT-20260601-122
- acceptance_note: accepted after all 8/8 worktracks completed; ParadeDB `pg_search` remains future runtime-enablement candidate only, VectorChord-BM25 and `pg_textsearch` are deferred, and default runtime remains native PostgreSQL FTS fallback plus pgvector.

### MS-15

- milestone_id: MS-15
- title: ParadeDB `pg_search` Runtime Replacement Validation
- status: accepted
- accepted_by: fdch0
- accepted_at: 2026-06-01
- source_artifact: .servo/milestone/MS-15.md
- completed_worktracks: WT-20260601-123, WT-20260601-124, WT-20260601-125, WT-20260601-126, WT-20260601-127
- acceptance_note: accepted after all 5/5 worktracks completed; ParadeDB `pg_search` candidate runtime passed compose, Prisma/app smoke, strict extension readiness, Chinese BM25 benchmark, hybrid invariant comparison, and rollback/runbook documentation; default runtime switch remained deferred and no production migration was performed.

### MS-16

- milestone_id: MS-16
- title: PostgreSQL Runtime Selection Review and ParadeDB Default Switch Decision
- status: accepted
- accepted_by: fdch0
- accepted_at: 2026-06-02
- source_artifact: .servo/milestone/MS-16.md
- completed_worktracks: WT-20260601-128, WT-20260601-129, WT-20260601-130, WT-20260601-131
- acceptance_note: fdch0 accepted Option 3; ParadeDB `pg_search` is the intended future default PostgreSQL runtime direction, but MS-16 made no default runtime switch, no app retrieval implementation, and no data migration/deletion. A follow-up implementation milestone or approved worktracks are required before any switch.

## Superseded Milestones

### MS-20260528-002

- milestone_id: MS-20260528-002
- title: docs 文档更新迭代与整理
- status: superseded
- superseded_by: MS-11
- superseded_at: 2026-05-29
- source_artifact: .servo/milestone/MS-20260528-002.md
- reason: docs catch-up moved after PostgreSQL hybrid search implementation.

### MS-20260529-001

- milestone_id: MS-20260529-001
- title: 中文知识检索增强与结构化索引
- status: superseded
- superseded_by: MS-9, MS-10, MS-11
- superseded_at: 2026-05-29
- source_artifact: .servo/milestone/MS-20260529-001.md
- reason: lightweight Chinese retrieval scope replaced by PostgreSQL + BM25/FTS + pgvector hybrid search.
