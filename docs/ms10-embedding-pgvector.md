# MS-10 Embedding And pgvector Runtime

## Scope

WT-20260529-085 adds the MS-10 vector retrieval lane. It does not implement RRF fusion, reranking, context window expansion, AI draft prompt integration, admin debug UI, background queues, or production reindex workflows.

## Schema

- `KnowledgeEmbedding.embedding` is a nullable `public.vector` column.
- Pending or failed embedding rows can exist without vector data.
- Ready rows have partial HNSW expression indexes for deterministic test dimension `3` and common provider dimensions `768`, `1024`, and `1536` with `public.vector_l2_ops`.
- Filtering support is kept through `KnowledgeEmbedding_profile_status_dimensions_idx`.
- Prisma represents the column as `Unsupported("public.vector")`; application reads and writes vector payloads through server-side raw SQL helpers.
- Because pgvector HNSW indexes require fixed dimensions and have a 2000-dimension limit, any production `SearchIndexProfile.embeddingDimensions` outside the indexed set must add a matching index/search strategy before approximate-index performance can be assumed. A 3072-dimension profile can still be stored and queried exactly, but cannot use this HNSW index shape.

## Runtime Boundary

- `src/lib/knowledge/embeddings.ts` owns the server-side embedding provider abstraction.
- `deterministic-test` is the local/test provider and does not represent production embedding quality.
- Non-test providers must have an enabled `EmbeddingProviderConfig` that matches the active `SearchIndexProfile` provider, model, and dimensions.
- Provider secrets stay in server-side config and are not returned in debug evidence.

## Fail-Closed Rules

Vector generation and candidate retrieval fail closed when:

- no active `SearchIndexProfile` exists;
- more than one profile is marked active;
- the active profile status is not `active`;
- a non-test provider lacks enabled server-side provider config;
- provider/model/dimensions do not match the active profile;
- provider output dimensions do not match profile dimensions;
- the snippet is disabled or belongs to a disabled/invalid source, version, or knowledge base.

## Candidate Retrieval

`retrieveVectorCandidates()` returns profile-scoped vector hits and evidence only. It does not fuse lexical and vector scores. Every vector query requires:

- `profileId = activeProfile.id`
- `status = ready`
- `dimensions = activeProfile.embeddingDimensions`
- `model = activeProfile.embeddingModel`
- enabled knowledge base/source/snippet filters
- ready source version filters
- optional selected knowledge-base filters

## Rollback Notes

For disposable or pre-production rollback:

1. Drop the `KnowledgeEmbedding_embedding_hnsw_*_idx` indexes.
2. Drop `KnowledgeEmbedding_profile_status_dimensions_idx`.
3. Drop `KnowledgeEmbedding.embedding`.

Do not drop the `vector` extension in a shared database unless no other table depends on it.
