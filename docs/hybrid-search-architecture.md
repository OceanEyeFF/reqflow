# Hybrid Search Architecture Decision

## Metadata

- status: accepted-for-MS-9-baseline
- worktrack: WT-20260529-078
- milestone: MS-9
- updated: 2026-05-31

## Decision Summary

ReqFlow will move knowledge retrieval from the current SQLite substring-scoring implementation toward a PostgreSQL-backed hybrid retrieval architecture. The target architecture uses PostgreSQL as the application database, combines lexical retrieval and vector retrieval, fuses ranked results with Reciprocal Rank Fusion style ranking, and feeds AI draft generation only through a bounded Context Window Builder.

The default lexical target is `pg_search`/BM25 when the later extension-readiness worktrack proves it deployable in the chosen PostgreSQL environment. If that readiness gate fails, MS-10 must use PostgreSQL native full-text search with explicit Chinese tokenization and normalization fallback. Vector retrieval uses `pgvector` only inside an active SearchIndexProfile whose embedding model, dimensions, and semantic space are immutable after creation.

This worktrack records architecture and risk boundaries only. It does not enable PostgreSQL, change Prisma schema, install extensions, generate embeddings, or alter runtime AI draft behavior.

## Current Repo Facts

- The current Prisma datasource is PostgreSQL in `prisma/schema.prisma` after WT-20260529-080.
- Current knowledge tables are `KnowledgeBase`, `KnowledgeSource`, `KnowledgeSourceVersion`, and `KnowledgeSnippet`.
- Current persistent retrieval lives in `src/lib/knowledge/retrieval.ts`. It fetches up to 100 enabled, ready snippets, scores them by substring term presence, and returns at most 3 persisted snippets.
- Current AI knowledge assembly lives in `src/lib/ai/knowledge.ts`. With selected knowledge bases it returns persisted snippets only; without selected bases it mixes persisted snippets with source-controlled fallback snippets and caps the total at 5.
- Current draft request validation in `src/lib/ai/draft-service.ts` deduplicates selected `knowledgeBaseIds` and caps them at 20.
- Current citation truth comes from locally selected knowledge context. The provider prompt asks the model to use supplied source IDs, but `src/lib/ai/deepseek-provider.ts` normalizes citations from `request.knowledge` rather than trusting model-supplied arbitrary citations.
- `KnowledgeBase` has no separate archive column today; the current disable/archive semantics are represented by `enabled=false`, with the default knowledge base protected by `src/lib/knowledge/bases.ts`.
- Current AI draft request flow is `src/app/api/ai/draft/route.ts` -> `src/lib/ai/draft-service.ts` -> provider adapter. AI output remains advisory and does not create tickets directly.
- Current CI uses a PostgreSQL service for lint/test/build and PostgreSQL readiness in `.github/workflows/ci.yml`.

These facts make MS-9 an architecture and readiness phase. Runtime implementation belongs to MS-10 and AI draft integration belongs to MS-11.

## External Facts Checked

- PostgreSQL native full text search provides `to_tsvector`, `websearch_to_tsquery`, `ts_rank`, `ts_rank_cd`, weighting, highlighting, and index support. PostgreSQL documentation also notes ranking can be expensive for large match sets and relevance tuning is application-specific.
- `pgvector` is the main open-source vector similarity search extension for PostgreSQL and supports approximate indexes such as HNSW and IVFFlat.
- ParadeDB documents `pg_search` as a PostgreSQL extension for BM25/full-text and hybrid search, with self-hosted installation requiring extension binaries, `shared_preload_libraries`, and `CREATE EXTENSION pg_search`.

References:

- PostgreSQL text search controls: https://www.postgresql.org/docs/current/textsearch-controls.html
- PostgreSQL text search indexes: https://www.postgresql.org/docs/current/textsearch-indexes.html
- pgvector README: https://github.com/pgvector/pgvector
- ParadeDB extension install: https://docs.paradedb.com/deploy/self-hosted/extension
- ParadeDB third-party extension overview: https://docs.paradedb.com/deploy/third-party-extensions

## Architecture Boundaries

### Query Understanding

Create an explicit query-understanding layer before retrieval. It should produce at least:

- `rawQuery`: original user requirement.
- `normalizedQuery`: Unicode-normalized, whitespace-normalized query.
- `lexicalQuery`: terms/phrases suitable for BM25 or FTS.
- `embeddingQuery`: concise semantic query for embedding.
- `mustTerms`: domain-critical terms that lexical retrieval should preserve.
- `domainEntities`: extracted business entities such as process names, material types, approval actions, document titles, paths, and sections.

This layer must not call the AI provider as a required path in MS-10. AI-assisted query rewriting can be a later optional enhancement only after privacy, cost, fallback, and test gates exist.

### Lexical Search

Preferred path:

- Use `pg_search` BM25 if WT-081 proves extension deployability, license/hosting compatibility, migration safety, and CI/dev/test availability.
- Index snippet text plus structured metadata fields that materially affect Chinese business recall.

Fallback path:

- Use PostgreSQL native FTS with explicit Chinese tokenization/normalization strategy.
- Store and test generated `tsvector` or equivalent indexed search fields.
- Use `websearch_to_tsquery` or a safer equivalent for user input, then tune ranking with source/title/section weights.

Fallback is not optional. If `pg_search` cannot be installed everywhere ReqFlow must run, the native FTS path must still satisfy the evaluation harness gates before MS-10 can pass.

### Vector Search

Use `pgvector` for semantic retrieval only after an active SearchIndexProfile exists. Vector retrieval must fail closed when:

- no active profile exists,
- profile status is `building`, `deprecated`, or invalid,
- stored vector dimensions differ from the profile dimensions,
- the requested knowledge base/source/snippet filters would require comparing vectors outside the same profile,
- embedding provider configuration is unavailable and no deterministic test provider is selected.

Vector results are candidate evidence, not final context by themselves.

### Hybrid Fusion

Use Reciprocal Rank Fusion style fusion over ranked lexical and vector candidate lists. Do not add raw BM25/FTS scores to raw vector similarity scores. The fused result should preserve:

- lexical rank and score evidence,
- vector rank and distance/similarity evidence,
- fusion rank and fusion contribution,
- filter reasons,
- final context membership reason.

The first implementation may use a fixed fusion constant and topK values, but the values must be visible to tests and debug evidence.

### Context Window Builder

The Context Window Builder is the only allowed path from retrieval results into AI draft provider context. It must:

- enforce selected knowledge-base scope,
- preserve the current selected-scope behavior unless MS-10 explicitly changes it: selected knowledge bases use persisted retrieval only, while unselected retrieval may include source-controlled fallback snippets,
- keep `KnowledgeBase.enabled`, source status/enabled, snippet enabled, and profile filters,
- merge adjacent chunks only when provenance remains clear,
- deduplicate overlapping spans,
- group context by source/path/section,
- enforce provider context size caps,
- emit citations only for included spans,
- keep retrieval results as the source of citation truth; model-returned citation IDs are not authoritative unless they match included context,
- return empty or degraded context without bypassing filters.

It is forbidden to send whole knowledge bases, whole uploaded archives, or all snippets to the provider as a retrieval substitute.

### Optional Reranker Seam

Reserve a `Reranker` interface after fusion and before context building. It must be optional and disabled by default. Any external reranker requires separate approval because it can change privacy, cost, latency, and provider surface area.

## Data Model Direction

MS-10 should introduce model names only after WT-079 through WT-081 confirm PostgreSQL readiness. The intended concepts are:

- `EmbeddingProviderConfig`: separate from `AiProviderConfig`; stores provider endpoint/model metadata and masked secret status.
- `SearchIndexProfile`: immutable profile for `embeddingModel`, `dimensions`, `semanticSpace`, `lexicalEngine`, status, and lifecycle.
- `KnowledgeSearchDocument` or equivalent indexed surface: denormalized searchable text plus structured metadata and source/version provenance.
- `KnowledgeEmbedding`: vector row linked to snippet/document, profile, content hash, dimensions, status, and generated timestamp.
- `RetrievalEvaluationCase`: query, expected source/snippet IDs, must contain terms, forbidden source IDs, recall/noise thresholds, and citation expectations.

SearchIndexProfile invariants:

- model and dimensions are immutable after profile creation,
- only one active profile should be used by default retrieval,
- changing model/dimensions creates a new profile and requires re-embedding/reindex,
- vectors from different profiles are never mixed or compared,
- deprecated profiles can be retained for rollback but cannot silently receive new embeddings.

## Filtered pgvector Risk Boundary

ReqFlow retrieval is heavily filtered by selected knowledge bases, enabled/archived status, source status, snippet status, and profile. Approximate vector indexes can lose recall when a narrow metadata filter is applied after candidate generation. Later worktracks must test and document:

- filter-first versus vector-first execution plans,
- larger vector candidate pools before filtering,
- partial indexes by profile or knowledge-base grouping,
- partitioning by profile or high-cardinality tenant-like dimensions if needed,
- exact fallback for small filtered candidate sets,
- recall@k and noise@k under selected knowledge-base filters.

No milestone gate may treat vector search as ready until filtered recall is measured by the evaluation harness.

## Debug Evidence Contract

Every retrieval call used by tests or admin debug surfaces should be able to expose:

- query understanding output,
- lexical candidates with rank, score, source, path, section, matched terms,
- vector candidates with profile, rank, similarity/distance, content hash, dimensions,
- filtered-out candidates and reasons,
- fused candidates with rank and contribution,
- context builder selected spans and exclusions,
- final citations sent to the AI provider,
- caps applied, including candidate topK and provider context size.

Debug evidence must not expose provider secrets, raw API keys, unauthorized knowledge content, or disabled knowledge content.

## Evaluation Harness Contract

WT-082 must make fixed Chinese business cases expressible with at least:

- `query`
- `selectedKnowledgeBaseIds`
- `expectedSourceIds`
- `expectedSnippetIds`
- `mustContainTerms`
- `forbiddenSourceIds`
- `minRecallAt5`
- `maxNoiseAt5`
- `citationTraceability`
- `expectedDebugEvidenceFields`

The harness must separately evaluate lexical-only, vector-only, fusion, filter behavior, and context builder output. A passing AI draft is not a substitute for passing retrieval gates.

Regression cases must include disabled/archived knowledge-base exclusion, disabled source exclusion, disabled snippet exclusion, selected knowledge-base scope, selected-scope fallback behavior, maximum selected knowledge-base IDs, and citation traceability from retrieval result to provider context.

## Follow-Up Mapping

- WT-20260529-079: make PostgreSQL dev/test/CI baseline real and reproducible.
- WT-20260529-080: define and execute Prisma provider migration boundary without silent data loss.
- WT-20260529-081: prove pgvector and BM25/FTS readiness, including `pg_search` deployability and native FTS fallback.
- WT-20260529-082: implement the Chinese retrieval evaluation harness and quality gate.
- MS-10: implement schema, lexical retrieval, embeddings, RRF fusion, filtering, context builder, and regression tests.
- MS-11: connect hybrid context to AI draft, citation UI/debug surface, final readiness, and docs/operator catch-up.

## Non-Goals

- No source-code implementation in WT-078.
- No Prisma schema or migration in WT-078.
- No package or extension install in WT-078.
- No background embedding jobs in WT-078.
- No external hosted search or third-party vector database approval in WT-078.
- No AI draft behavior change in WT-078.

## Gate Checklist

- Architecture decision exists and maps to MS-9 completion signals.
- Preferred and fallback lexical paths are explicit.
- SearchIndexProfile immutability is explicit.
- RRF fusion avoids raw-score mixing.
- Filtered vector search risk is explicit.
- Debug and evaluation evidence contracts are explicit.
- Future worktrack boundaries are clear.
