# MS-12 Local Embedding Indexing Trial

## What Was Validated

WT-20260601-107 validates the optional local embedding sidecar path at the application seam without making it the runtime default.

The regression and explicit trial script cover this chain:

1. An enabled server-side `EmbeddingProviderConfig` exists for `local-cpu-sidecar`.
2. The active `SearchIndexProfile` references that provider, model, dimensions, and config.
3. A ready knowledge snippet is indexed through `generateKnowledgeSnippetEmbedding` with an injected sidecar-shaped provider.
4. The generated vector is persisted in `KnowledgeEmbedding.embedding` as pgvector data.
5. `retrieveHybridKnowledgeSnippets` uses the same provider for query embedding.
6. Hybrid evidence reports a ready vector lane and a fused hit with both lexical and vector rank.

`npm run embedding:indexing-trial` runs the same path against a real local HTTP sidecar endpoint in an isolated temporary PostgreSQL schema and drops that schema after the trial.

## Current Boundary

The validated path is a trial and remains opt-in:

- The default embedding provider remains `deterministic-test` for local deterministic behavior.
- The local sidecar is not started automatically.
- No model weights are downloaded by the application.
- No production knowledge base is batch reindexed.
- No background indexing queue is introduced.
- Provider config remains server-side and is not exposed to clients.

If an active profile expects `local-cpu-sidecar`, the default provider fails closed with `provider-unavailable`. Callers must inject a matching provider or wire an explicitly configured server-side adapter.

## Deferred Production Work

Productionizing this path is intentionally deferred until the runtime bundle milestone can verify:

- Docker image and model-weight packaging strategy.
- CPU latency and concurrency limits for admin indexing and query embedding.
- Operational health checks and retry/backoff behavior.
- Explicit reindex controls for model or dimension changes.
- Clear operator documentation for enabling/disabling the sidecar.

MS-12 can therefore claim that the real indexing chain is tested, but it must not claim that local embedding sidecar is enabled by default or production-ready.
