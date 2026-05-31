# Milestone: PostgreSQL 与 Hybrid Search 架构基线

## Metadata

- milestone_id: MS-9
- title: PostgreSQL 与 Hybrid Search 架构基线
- milestone_kind: goal-driven
- status: completed
- priority: 9
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-05-31
- updated_by: harness-kernel

## Purpose

将 ReqFlow 的知识库检索方向从 SQLite 轻量 includes/n-gram 增强，重设为 PostgreSQL hybrid search 基线。该 milestone 只建立架构决策、PostgreSQL dev/test/CI 可复现基线、Prisma/provider 迁移边界、pgvector readiness、BM25/FTS 可部署性和中文检索评测语料，不直接完成最终 AI 草稿接入。

## Scope Boundary

- 允许引入 PostgreSQL 作为应用主数据库目标。
- 允许引入 pgvector，并优先评估 BM25 方案 `pg_search`；若不可部署，必须给出 PostgreSQL native FTS + 中文分词/归一化 fallback。
- Embedding provider 必须独立于现有 AI chat provider 配置；MS-9 必须定义 SearchIndexProfile 概念，锁定 embedding model、dimensions、semantic space、lexical engine 和 active/deprecated 状态。
- Hybrid Search 架构必须定义 query understanding、lexical search、vector search、fusion ranking、context building 和 debug evidence 的模块边界，避免把所有逻辑塞进单个 retrieval 函数。
- MS-9 需要定义 retrieval evaluation harness 的输入格式和 gate 指标，覆盖 expected source/snippet、must contain terms、forbidden sources、recall@k、noise@k 和 citation traceability。
- 不引入外部托管搜索服务、第三方向量数据库或不可控常驻检索服务，除非 fdch0 单独确认。
- 不静默删除 SQLite 数据或业务 schema；迁移必须包含 rollback/restore notes。
- 不把全部知识内容直接发送给 AI provider 作为检索替代。

## Worktrack List

| # | worktrack_id | title | node_type | status |
|---|-------------|-------|-----------|--------|
| 1 | WT-20260529-078 | Hybrid Search 架构决策与风险边界 | architecture | completed |
| 2 | WT-20260529-079 | PostgreSQL dev/test/CI 数据库基线 | migration | completed |
| 3 | WT-20260529-080 | Prisma PostgreSQL provider 迁移边界 | migration | completed |
| 4 | WT-20260529-081 | pgvector 与 BM25/FTS extension readiness | architecture | completed |
| 5 | WT-20260529-082 | 中文检索评测语料、Evaluation Harness 与质量 Gate | test | completed |
| 6 | WT-20260531-094 | MS-9 代码验收与集成风险审查 | review | completed |
| 7 | WT-20260531-095 | MS-9 grill-me 反向拷打验收 | review | completed |
| 8 | WT-20260531-096 | MS-9 最终 CodeReview Worktrack | review | completed |

## Design Decisions To Carry Forward

1. Hybrid ranking 默认采用 Reciprocal Rank Fusion 类方法融合 lexical 与 vector 排名，不直接比较 BM25 分数和向量相似度原始值。
2. Reranker 作为后续可插拔 seam 预留，不作为 MS-9/MS-10 必须引入的第三方依赖。
3. Query understanding 输出应至少区分 `rawQuery`、`normalizedQuery`、`lexicalQuery`、`embeddingQuery`、`mustTerms` 和 `domainEntities`。
4. Search index metadata 应显式考虑 `domainEntities`、`processNames`、`materialTypes`、`approvalActions`、`applicabilityRules`、`sourcePath`、`section` 和 `documentTitle`。
5. pgvector filtered search 必须把 `knowledgeBaseId`、`sourceId`、enabled/status、`profileId` 过滤对 recall/performance 的影响写入风险边界；必要时用 larger topK、partial indexes 或 partitioning 缓解。
6. Admin/debug surface 在 MS-9 先定义数据契约，MS-10/MS-11 再实现；应能解释 lexical hits、vector hits、fused hits、filtered reasons、final context 和 score breakdown。

## Completion Signals

1. 有明确的 hybrid search ADR，说明 PostgreSQL、pgvector、BM25/FTS、fallback 和部署约束。
2. 本地 dev/test/CI 能使用 PostgreSQL 数据库运行 Prisma generate、migrate status、lint/test/build 所需数据库准备。
3. Prisma schema/provider 迁移边界清楚，SQLite 到 PostgreSQL 的数据/seed/test 策略可复现。
4. pgvector readiness 可验证；BM25 优先方案和 fallback 方案都有可执行判断。
5. SearchIndexProfile 决策明确：首次 active profile 锁定 embedding model/dimensions/semantic space，换模型或维度必须新建 profile 并重建 embeddings。
6. 固定中文业务检索评测语料存在，并定义 recall、precision/误召回、forbidden source、noise@k 和 citation traceability gate。
7. Query understanding、retriever provider abstractions、RRF fusion、context builder、reranker seam 和 debug evidence contract 在 ADR 中有明确边界。

## Acceptance Criteria

1. `DATABASE_URL` 指向 PostgreSQL 时 Prisma validate 和 migrate status 可通过。
2. CI 或等价本地脚本能准备 PostgreSQL 测试数据库。
3. 若 `pg_search` 不可用，必须记录 fallback 到 PostgreSQL native FTS + 中文分词/归一化的原因和限制。
4. EmbeddingProviderConfig 不复用 AiProviderConfig；provider secret 只在服务端可读，UI 只显示 masked/configured 状态。
5. SearchIndexProfile 的 model/dimensions 创建后不可变；不同 profile 的 vectors 不可混排。
6. 不改变 AI 草稿人工确认边界。
7. 不绕过知识库 enabled/archived/source/snippet 过滤。
8. Evaluation harness 至少能表达 query、expectedSourceIds、expectedSnippetIds、mustContainTerms、forbiddenSourceIds、minRecallAt5、maxNoiseAt5。
9. `git diff --check`、`npm run lint`、`npm run test`、`npm run build` 至少在最终 worktrack 通过。

## Completion Threshold

- completion_threshold_pct: 100

## Dependencies

- depends_on_milestones: [MS-20260528-003]
- supersedes: [MS-20260528-002, MS-20260529-001]

## Progress Counter

- total_worktracks: 8
- completed: 8
- blocked: 0
- deferred: 0

## Aggregated Evidence

- .servo/worktrack/WT-20260529-078/gate-evidence.md
- .servo/worktrack/WT-20260529-079/gate-evidence.md
- .servo/worktrack/WT-20260529-080/gate-evidence.md
- .servo/worktrack/WT-20260529-081/gate-evidence.md
- .servo/worktrack/WT-20260529-082/gate-evidence.md
- .servo/worktrack/WT-20260531-094/gate-evidence.md
- .servo/worktrack/WT-20260531-095/gate-evidence.md
- .servo/worktrack/WT-20260531-096/gate-evidence.md
- docs/ms9-final-acceptance-report.md

## Final Acceptance Handback

- milestone_gate_verdict: pass
- final_acceptance_status: accepted
- acceptance_report: docs/ms9-final-acceptance-report.md
- handback_at: 2026-05-31
- accepted_by: fdch0
- accepted_at: 2026-05-31 17:00:10 +08:00
- acceptance_note: accepted after WT-096 final CodeReview; local MS-9 validation is sufficient and remote GitHub Actions freshness remains a non-blocking follow-up.
- added_worktracks: WT-20260531-094, WT-20260531-095, WT-20260531-096
- grill_me_decision: fdch0 accepted local WT-094 validation as sufficient; remote GitHub Actions freshness is not an MS-9 acceptance blocker.

## Milestone Gate Design

- black_box: 开发者能在 PostgreSQL dev/test 环境下启动应用验证知识库基础功能不回退。
- white_box: Prisma provider、migration、extension readiness、评测语料、evaluation harness contract、debug evidence contract 和 CI 数据库准备均有证据。
- anti_cheat: 不允许只写文档不验证数据库；不允许跳过 extension readiness；不允许把不可部署的 BM25 方案写成默认事实；不允许将 vector-only 检索包装成 hybrid search。
- embedding_profile_rule: 不允许通过直接编辑 provider config 静默改变 active embedding model/dimensions；必须新建 SearchIndexProfile 并执行 re-embedding/reindex gate。

## Developer Decision Boundary

- 外部托管搜索、第三方向量数据库、生产数据迁移执行、不可控后台 embedding job、付费 provider 策略变化、切换 active embedding profile 需要 fdch0 单独确认。
