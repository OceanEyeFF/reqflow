# Worktrack Contract: WT-20260601-107

## Metadata

- worktrack_id: WT-20260601-107
- title: 本地 embedding sidecar 真实索引链路试接入
- milestone_id: MS-12
- node_type: feature
- status: active
- branch: worktrack/wt-20260601-107-local-embedding-indexing
- baseline_branch: develop
- started_at: 2026-06-01
- owner: codex

## Objective

验证可选本地 embedding sidecar provider 在现有 `EmbeddingProvider` seam 下可以经过真实索引链路：

1. 服务端 provider config 与 active `SearchIndexProfile` 对齐。
2. 单个 ready snippet 生成并 upsert `KnowledgeEmbedding.embedding` pgvector 数据。
3. 同一 provider 可用于 query embedding 和 vector retrieval。
4. hybrid retrieval 的 vector lane 与 RRF fused evidence 能显示该索引链路已经生效。

## Scope

- Add focused regression coverage for the optional local sidecar indexing path.
- Add an explicit local sidecar indexing trial gate that uses an isolated temporary database schema.
- Record sidecar indexing trial evidence and operational boundary for MS-12.
- Keep the current deterministic default and fail-closed provider guards intact.

## Out Of Scope

- Enabling the local sidecar as a default runtime or production path.
- Downloading model weights, starting Docker services, or changing host system configuration.
- Bulk rebuilding existing knowledge embeddings.
- Schema migrations, new background queues, or production reindex workflow.
- Claiming BM25/pg_search runtime availability.

## Acceptance Criteria

1. A test proves the sidecar-shaped provider config must be explicit and the deterministic default cannot silently satisfy a local sidecar profile.
2. The test generates a real `KnowledgeEmbedding` row with pgvector data for a ready snippet.
3. Hybrid retrieval with the same injected sidecar provider returns ready vector-lane evidence and fused hit evidence.
4. Documentation records that the sidecar path is optional and manually operated until MS-13/runtime packaging work validates it.
5. Existing MS-12 gates still pass, including lint, full tests, build, PostgreSQL readiness, search extension readiness, retrieval evaluation, and golden clarification gate.

## Risk Controls

- No provider secret is introduced.
- No client-side exposure of provider configuration is introduced.
- Test data remains isolated in test schemas.
- Production defaults remain unchanged.
