# Milestone: PostgreSQL 与 Hybrid Search 架构基线

## Metadata

- milestone_id: MS-9
- title: PostgreSQL 与 Hybrid Search 架构基线
- milestone_kind: goal-driven
- status: planned
- priority: 9
- created_by: fdch0
- created_at: 2026-05-29
- updated: 2026-05-29
- updated_by: harness-kernel

## Purpose

将 ReqFlow 的知识库检索方向从 SQLite 轻量 includes/n-gram 增强，重设为 PostgreSQL hybrid search 基线。该 milestone 只建立架构决策、PostgreSQL dev/test/CI 可复现基线、Prisma/provider 迁移边界、pgvector readiness、BM25/FTS 可部署性和中文检索评测语料，不直接完成最终 AI 草稿接入。

## Scope Boundary

- 允许引入 PostgreSQL 作为应用主数据库目标。
- 允许引入 pgvector，并优先评估 BM25 方案 `pg_search`；若不可部署，必须给出 PostgreSQL native FTS + 中文分词/归一化 fallback。
- Embedding provider 必须独立于现有 AI chat provider 配置；MS-9 必须定义 SearchIndexProfile 概念，锁定 embedding model、dimensions、semantic space、lexical engine 和 active/deprecated 状态。
- 不引入外部托管搜索服务、第三方向量数据库或不可控常驻检索服务，除非 fdch0 单独确认。
- 不静默删除 SQLite 数据或业务 schema；迁移必须包含 rollback/restore notes。
- 不把全部知识内容直接发送给 AI provider 作为检索替代。

## Worktrack List

| # | worktrack_id | title | node_type | status |
|---|-------------|-------|-----------|--------|
| 1 | WT-20260529-078 | Hybrid Search 架构决策与风险边界 | architecture | planned |
| 2 | WT-20260529-079 | PostgreSQL dev/test/CI 数据库基线 | migration | planned |
| 3 | WT-20260529-080 | Prisma PostgreSQL provider 迁移边界 | migration | planned |
| 4 | WT-20260529-081 | pgvector 与 BM25/FTS extension readiness | architecture | planned |
| 5 | WT-20260529-082 | 中文检索评测语料与质量 Gate | test | planned |

## Completion Signals

1. 有明确的 hybrid search ADR，说明 PostgreSQL、pgvector、BM25/FTS、fallback 和部署约束。
2. 本地 dev/test/CI 能使用 PostgreSQL 数据库运行 Prisma generate、migrate status、lint/test/build 所需数据库准备。
3. Prisma schema/provider 迁移边界清楚，SQLite 到 PostgreSQL 的数据/seed/test 策略可复现。
4. pgvector readiness 可验证；BM25 优先方案和 fallback 方案都有可执行判断。
5. SearchIndexProfile 决策明确：首次 active profile 锁定 embedding model/dimensions/semantic space，换模型或维度必须新建 profile 并重建 embeddings。
6. 固定中文业务检索评测语料存在，并定义 recall、precision/误召回和 citation traceability gate。

## Acceptance Criteria

1. `DATABASE_URL` 指向 PostgreSQL 时 Prisma validate 和 migrate status 可通过。
2. CI 或等价本地脚本能准备 PostgreSQL 测试数据库。
3. 若 `pg_search` 不可用，必须记录 fallback 到 PostgreSQL native FTS + 中文分词/归一化的原因和限制。
4. EmbeddingProviderConfig 不复用 AiProviderConfig；provider secret 只在服务端可读，UI 只显示 masked/configured 状态。
5. SearchIndexProfile 的 model/dimensions 创建后不可变；不同 profile 的 vectors 不可混排。
6. 不改变 AI 草稿人工确认边界。
7. 不绕过知识库 enabled/archived/source/snippet 过滤。
8. `git diff --check`、`npm run lint`、`npm run test`、`npm run build` 至少在最终 worktrack 通过。

## Completion Threshold

- completion_threshold_pct: 100

## Dependencies

- depends_on_milestones: [MS-20260528-003]
- supersedes: [MS-20260528-002, MS-20260529-001]

## Progress Counter

- total_worktracks: 5
- completed: 0
- blocked: 0
- deferred: 0

## Aggregated Evidence

- pending

## Milestone Gate Design

- black_box: 开发者能在 PostgreSQL dev/test 环境下启动应用验证知识库基础功能不回退。
- white_box: Prisma provider、migration、extension readiness、评测语料和 CI 数据库准备均有证据。
- anti_cheat: 不允许只写文档不验证数据库；不允许跳过 extension readiness；不允许把不可部署的 BM25 方案写成默认事实。
- embedding_profile_rule: 不允许通过直接编辑 provider config 静默改变 active embedding model/dimensions；必须新建 SearchIndexProfile 并执行 re-embedding/reindex gate。

## Developer Decision Boundary

- 外部托管搜索、第三方向量数据库、生产数据迁移执行、不可控后台 embedding job、付费 provider 策略变化、切换 active embedding profile 需要 fdch0 单独确认。
