# MS-10 Search Index Schema

## Scope

WT-20260529-083 adds the schema baseline for MS-10 hybrid retrieval. It does not implement query understanding, lexical retrieval, embedding generation, vector search, fusion, context expansion, or AI draft integration.

## Tables

- `EmbeddingProviderConfig`: stores server-side embedding provider configuration separately from `AiProviderConfig`.
- `SearchIndexProfile`: locks embedding provider, model, dimensions, semantic space, lexical engine, status, and active intent for a searchable vector/lexical space.
- `KnowledgeSnippetSearchMetadata`: stores snippet-level lexical/index metadata such as document title, source path, section, content hash, and structured business tags.
- `KnowledgeEmbedding`: binds a snippet to exactly one profile-specific embedding record with model, dimensions, content hash, generation status, optional `vectorRef`, and WT-085 `public.vector` payload.

## Invariants

- Embedding provider configuration is distinct from chat provider configuration.
- Embeddings are profile-scoped through `KnowledgeEmbedding.profileId`.
- A snippet can have at most one embedding record per profile.
- Metadata remains attached to an existing `KnowledgeSnippet` and cascades when that snippet is deleted.
- Existing knowledge base, source, version, and snippet import data is not deleted or rewritten by this migration.
- Actual pgvector column/index implementation is added by WT-20260529-085. Runtime behavior is documented in `docs/ms10-embedding-pgvector.md`.

## Rollback Notes

This migration only creates new tables and indexes. To roll it back in a disposable or pre-production environment, drop the tables in dependency order:

1. `KnowledgeEmbedding`
2. `KnowledgeSnippetSearchMetadata`
3. `SearchIndexProfile`
4. `EmbeddingProviderConfig`

Production rollback must first confirm that no MS-10 runtime has begun writing profile metadata or embeddings that must be preserved. If runtime writes exist, export those rows before dropping tables.

