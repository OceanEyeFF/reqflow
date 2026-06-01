# WT-20260601-107 Gate Evidence

## Metadata

- worktrack_id: WT-20260601-107
- title: 本地 embedding sidecar 真实索引链路试接入
- milestone_id: MS-12
- branch: worktrack/wt-20260601-107-local-embedding-indexing
- status: passed
- updated: 2026-06-01

## Implementation Evidence

- Added focused regression coverage in `src/lib/knowledge/retrieval.test.ts`.
- The regression uses an explicit `EmbeddingProviderConfig` and active `SearchIndexProfile` for `local-cpu-sidecar`.
- The deterministic default provider is first asserted to fail against the sidecar profile with `provider-unavailable`.
- The HTTP sidecar adapter then generates a ready `KnowledgeEmbedding` pgvector row through `generateKnowledgeSnippetEmbedding`.
- `retrieveHybridKnowledgeSnippets` with the same injected provider returns ready vector lane evidence and RRF fused evidence with both lexical and vector ranks.
- Added `scripts/local-embedding-indexing-trial.ts` and `npm run embedding:indexing-trial` for a real local HTTP sidecar -> temporary DB schema -> pgvector -> hybrid retrieval gate.

## Boundary Evidence

- No production default provider was changed.
- No Docker service, model download, or host system configuration was started by this worktrack.
- No migration, schema change, background queue, bulk reindex, or external vector database was introduced.
- `pg_search`/BM25 remains unavailable in the current runtime and is not claimed as active behavior.
- The sidecar remains optional/manual until runtime packaging and operational controls are accepted in a later milestone.

## Validation

- `node --check scripts/local-embedding-sidecar-probe.mjs`: pass.
- `npm run embedding:probe`: pass.
  - Endpoint: `http://127.0.0.1:8081/embed`.
  - Request format: `tei`.
  - Model: `intfloat/multilingual-e5-large`.
  - Dimensions: `1024`.
  - Iterations: `3`.
  - Latency: min `66.28ms`, p50 `85.39ms`, p95 `846.3ms`, max `930.85ms`.
- `npm run embedding:indexing-trial`: pass.
  - Temporary schema: `test_local_embedding_indexing_39508_1780284740300_3htwqa`.
  - Provider: `local-cpu-sidecar`.
  - Model: `intfloat/multilingual-e5-large`.
  - Dimensions: `1024`.
  - Persisted `KnowledgeEmbedding.embedding` vector dimensions: `1024`.
  - Hybrid `vectorLane`: `ready`, candidates returned `1`.
  - Top fused hit had both `lexicalRank: 1` and `vectorRank: 1`.
  - Script cleaned up the temporary schema after execution.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npx vitest run src/lib/knowledge/embedding-http-provider.test.ts src/lib/knowledge/embeddings.test.ts src/lib/knowledge/retrieval.test.ts`: pass, 3 files / 49 tests.
- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass.
  - Next.js 16.2.6 build completed.
  - Non-blocking warning remains: Turbopack inferred the main checkout root because both main checkout and worktree contain lockfiles.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run postgres:readiness`: pass.
  - `prisma validate`: pass.
  - `prisma migrate status`: database schema is up to date; 9 migrations found.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions`: pass.
  - PostgreSQL `16.14`.
  - pgvector `0.8.2`: pass.
  - native PostgreSQL FTS: pass.
  - `pg_search`: unavailable in current image; native PostgreSQL FTS fallback remains required.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `npm run clarification:golden`: pass, `cn-consumables-standard-inspection-outbound` with 7 questions.
- `git diff --check`: pass.

## Gate Decision

Passed for WT-20260601-107.

WT-107 validates the optional local HTTP embedding sidecar indexing chain through a real local sidecar endpoint, temporary PostgreSQL schema, pgvector persistence, vector retrieval, and hybrid fused evidence. It does not enable sidecar as the default runtime path and does not claim production readiness.
