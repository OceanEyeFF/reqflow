# Gate Evidence: WT-20260529-085

## Metadata

- worktrack_id: WT-20260529-085
- title: Embedding 生成与 pgvector 索引
- milestone_id: MS-10
- branch: worktrack/wt-20260529-085-embedding-pgvector-index
- status: gate-passed

## Implementation Evidence

- Added pgvector persistence to `KnowledgeEmbedding` through `embedding Unsupported("public.vector")?` and migration `20260531184500_add_pgvector_embedding`.
- Migration enables `vector`, adds nullable `public.vector` storage, profile/status/dimensions filtering index, and partial HNSW expression indexes for dimensions 3, 768, 1024, and 1536.
- Added `src/lib/knowledge/embeddings.ts` with server-side `EmbeddingProvider`, deterministic `deterministic-test` provider, profile-bound embedding generation/upsert, and vector candidate retrieval.
- Vector generation fails closed for missing active profile, multiple active profiles, non-active active profile, missing/disabled/mismatched provider config, provider identity mismatch, dimensions mismatch, and unavailable snippets.
- Vector retrieval filters by active profile id, model, metadata dimensions, physical `vector_dims`, ready status, enabled knowledge base/source/snippet, ready version, and optional selected knowledge-base ids.
- Added focused tests in `src/lib/knowledge/embeddings.test.ts`.
- Updated test schema helper to create the `vector` extension before Prisma `db push`.
- Added operator/runtime notes in `docs/ms10-embedding-pgvector.md` and updated `docs/ms10-search-index-schema.md`.

## Validation Evidence

- `npm ci`: pass.
- `npx prisma generate --schema prisma/schema.prisma`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx prisma validate --schema prisma/schema.prisma`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run search:extensions`: pass; pgvector readiness pass, native PostgreSQL FTS readiness pass, `pg_search` unavailable fallback recorded.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx prisma migrate deploy --schema prisma/schema.prisma`: pass after fixing HNSW dimension constraints discovered by local deploy validation.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run postgres:readiness`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx vitest run src/lib/knowledge/embeddings.test.ts`: pass, 1 file / 14 tests.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx vitest run src/lib/knowledge/embeddings.test.ts src/lib/knowledge/retrieval.test.ts src/lib/knowledge/search-index-schema.test.ts`: pass, 3 files / 24 tests.
- `npm run lint`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run test`: pass, 30 files / 221 tests.
- `npm run build`: pass; known Next.js multi-lockfile worktree warning only.
- Read-only review subagent findings were consumed; valid provider-output and physical vector-dimension guard issues were fixed before final validation.

## Policy Review

- Scope stayed within embedding generation, pgvector persistence/indexing, vector candidate retrieval, tests, and docs.
- RRF fusion, reranking, context builder, citation aggregation, AI draft integration, admin UI, background queue, external vector DB, and production reindex workflows remain deferred.
- EmbeddingProviderConfig remains separate from AiProviderConfig.
- Deterministic test provider is explicitly marked as local/test quality only and does not expose secrets.
- Vector comparison is profile/model/dimensions/status scoped and does not mix semantic spaces.
- Existing lexical retrieval and public citation API were not changed.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
