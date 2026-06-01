# MS-12 Final Validation

## Status

- milestone_id: MS-12
- title: AI 需求追问质量升级与 Business Interrogation
- status: accepted
- date: 2026-06-01
- develop_head: `600dddf`
- worktracks_completed: 8/8
- accepted_by: fdch0
- accepted_at: 2026-06-01

## Completed Worktracks

| worktrack | commit | evidence |
|---|---:|---|
| WT-20260601-101 检索覆盖诊断与追问 evidence 结构 | `486ff25` | `.servo/worktrack/WT-20260601-101/gate-evidence.md` |
| WT-20260601-114 Build gate font network dependency recovery | `2c642c1` | `.servo/worktrack/WT-20260601-114/gate-evidence.md` |
| WT-20260601-102 BM25/pg_search readiness 与 lexical engine 抽象 | `7d9b680` | `.servo/worktrack/WT-20260601-102/gate-evidence.md` |
| WT-20260601-103 Clarify question schema 升级 | `a723c8a` | `.servo/worktrack/WT-20260601-103/gate-evidence.md` |
| WT-20260601-104 Provider prompt 升级为业务审查模式 | `0ee02bb` | `.servo/worktrack/WT-20260601-104/gate-evidence.md` |
| WT-20260601-105 AI 追问前端分组展示与回答交互改造 | `4965a55` | `.servo/worktrack/WT-20260601-105/gate-evidence.md` |
| WT-20260601-106 耗材标准检验出库 golden case 验收 | `023912f` | `.servo/worktrack/WT-20260601-106/gate-evidence.md` |
| WT-20260601-107 本地 embedding sidecar 真实索引链路试接入 | `600dddf` | `.servo/worktrack/WT-20260601-107/gate-evidence.md` |

## Final Gate Evidence

- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass on Next.js 16.2.6.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run postgres:readiness`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions`: pass.
  - PostgreSQL `16.14`.
  - pgvector `0.8.2`: pass.
  - native PostgreSQL FTS: pass.
  - `pg_search`: unavailable in current image; native PostgreSQL FTS fallback remains required.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `npm run clarification:golden`: pass, `cn-consumables-standard-inspection-outbound` with 7 questions.
- `node --check scripts/local-embedding-sidecar-probe.mjs`: pass.
- `npm run embedding:probe`: pass against `http://127.0.0.1:8081/embed`, TEI format, 1024 dimensions, 3 iterations.
- `npm run embedding:indexing-trial`: pass with a real local HTTP sidecar endpoint, temporary PostgreSQL schema, 1024-dimensional pgvector persistence, ready vector lane, and fused hit evidence.
- Direct embedding environment test plan: pass.
  - Sidecar metadata probe: `GET http://127.0.0.1:8081/health` returned 200; `GET http://127.0.0.1:8081/info` reported `model_id: intfloat/multilingual-e5-large`, `model_dtype: float32`, `pooling: mean`, TEI `version: 1.9.3`, docker label `sha-0667015`, max input length `512`, max batch requests `8`.
  - Direct vector probe: `POST http://127.0.0.1:8081/embed` with a Chinese consumables outbound-inspection query returned a finite 1024-dimensional vector in `809.43ms`; first three values were `0.04207405`, `-0.01662089`, `0.002197301`.
  - Database/vector environment probe: `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions` passed PostgreSQL `16.14`, pgvector `0.8.2`, and native FTS; `pg_search` remained unavailable as expected.
  - Sidecar latency probe: `npm run embedding:probe` passed with 3 TEI calls, min `69.98ms`, p50 `91.61ms`, p95 `115.92ms`, max `118.62ms`.
  - Application indexing probe: `npm run embedding:indexing-trial` passed using temporary schema `test_local_embedding_indexing_12044_1780289613633_3aow5i`; persisted `KnowledgeEmbedding.embedding` with 1024 vector dimensions; hybrid `vectorLane` was `ready` with 1 candidate and top fused hit had `lexicalRank: 1` and `vectorRank: 1`.
- Playwright browser smoke: pass on `http://127.0.0.1:3012/tickets/ai-discussion`.
  - Logged in with seeded `admin/admin123`.
  - Intercepted `POST /api/ai/draft` with deterministic MS-12 clarification schema.
  - Verified `阻塞问题`, `知识库缺口`, and `推荐追问` groups render in the browser.
  - Verified `阻塞草稿` badges render, an answer can be entered and preserved, and search evidence shows `active-profile-missing`.
  - Browser console check: 0 errors, 0 warnings.
  - Network check: `/api/knowledge/bases` 200, `/api/auth/session` 200, intercepted `/api/ai/draft` 200.
- `git diff --check`: pass.

## Acceptance Criteria Mapping

1. Coverage diagnostics, empty-hit behavior, safe evidence serialization, and provider request shape are covered by WT-101, WT-104, and existing AI route/provider tests.
2. Clarify output schema covers `category`, `priority`, `blocksDraft`, `basis`, `relatedText`, and `expectedAnswerFormat` through WT-103 and WT-104.
3. Frontend grouping and answer preservation are covered by WT-105.
4. The consumables outbound-inspection golden gate rejects generic questions and passed with 7 targeted questions in WT-106.
5. Build, lint, tests, PostgreSQL readiness, search extension readiness, and retrieval evaluation passed.
6. Provider secrets, raw API keys, disabled knowledge content, and unauthorized knowledge-base content are not exposed in search evidence or UI.

## Boundaries Preserved

- MS-12 does not enable BM25/pg_search as runtime behavior.
- MS-12 does not make local embedding sidecar the default production path.
- MS-12 does not introduce external hosted search, third-party vector databases, external rerankers, batch production embedding rebuilds, or provider cost-boundary changes.
- AI draft human confirmation boundary remains unchanged.

## pg_search Unavailable Analysis

`pg_search` is unavailable because the current local and CI PostgreSQL baseline uses `pgvector/pgvector:0.8.2-pg16`, which packages PostgreSQL 16 with the `vector` extension but does not expose ParadeDB's `pg_search` extension in `pg_available_extensions`.

The readiness script checks the database capability directly:

- It queries `pg_available_extensions` for `vector` and `pg_search`.
- In the current image, only `vector` appears and passes creation/query/index probes.
- Native PostgreSQL FTS also passes with the `simple` configuration.
- Because `pg_search` is absent from the image, `CREATE EXTENSION pg_search` is not attempted as an active runtime path unless a target environment exposes it.

This is an environment packaging boundary, not an application fallback failure. Enabling BM25 requires a future target runtime that either uses a PostgreSQL image with ParadeDB `pg_search` installed or a managed PostgreSQL service that exposes and permits `CREATE EXTENSION pg_search`. That future work must prove extension availability, isolated extension creation, BM25 index/query probes, retrieval quality, fallback behavior, and operator documentation before changing the active lexical engine from `postgres-native-fts-fallback` to `pg-search-bm25`.

## Handback

MS-12 was accepted by fdch0 on 2026-06-01 after reviewing the Playwright smoke, direct embedding environment tests, local sidecar indexing trial, and the `pg_search` unavailable analysis above.
