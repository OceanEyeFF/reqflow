# Search Extension Readiness

## Metadata

- worktrack: WT-20260529-081
- milestone: MS-9
- updated: 2026-05-31

## Decision

ReqFlow's MS-9 search-extension baseline uses:

- `pgvector` as the required vector extension for dev/test/CI.
- PostgreSQL native full-text search as the required lexical fallback.
- `pg_search` / BM25 as the preferred lexical target only when a target environment proves the extension binary and preload requirements are available.

WT-081 does not implement hybrid retrieval or add application search-index tables. It only proves extension readiness and records fallback boundaries for MS-10.

## Dev/Test/CI Image

The PostgreSQL service image is:

```yaml
image: pgvector/pgvector:0.8.2-pg16
```

This image keeps the PostgreSQL 16 baseline while making the `vector` extension available in local compose and CI service containers.

## Readiness Command

```bash
npm run search:extensions
```

The command uses `SEARCH_EXTENSION_DATABASE_URL`, `POSTGRES_DATABASE_URL`, or `DATABASE_URL` as a maintenance connection, then creates a temporary probe database and drops it after the check. This matters because PostgreSQL extensions are database-scoped, not schema-scoped; the readiness command must not leave extension state behind in the caller's application database. It verifies:

- PostgreSQL server version is readable.
- `vector` is present in `pg_available_extensions`.
- `CREATE EXTENSION IF NOT EXISTS vector` succeeds inside the temporary probe database.
- A `vector(3)` probe table can insert vectors and order by L2 distance.
- HNSW vector index DDL succeeds.
- Native PostgreSQL FTS can search pre-tokenized Chinese business text using the `simple` configuration and `websearch_to_tsquery`.
- Native FTS GIN index DDL succeeds.
- BM25 candidate availability is detected for `pg_search`, `pg_textsearch`, `vchord_bm25`, and `pg_tokenizer`.
- `pg_search` availability and loadability are still detected separately for the ParadeDB-specific strict path.

If `pg_search` is unavailable, the command passes with an explicit fallback message. Set `SEARCH_REQUIRE_PG_SEARCH=true` only in an environment where BM25 extension availability is mandatory.
If no BM25 candidate is available, the command also passes with an explicit fallback message. Set `SEARCH_REQUIRE_BM25_EXTENSION=true` only when validating a target runtime image that is expected to expose at least one supported BM25 candidate.

Do not point this command at a production database or a database user that cannot create/drop temporary databases. It is a dev/test/CI readiness probe.

## pg_search Boundary

`pg_search` is not enabled by default in this repository's PostgreSQL image. ParadeDB's extension path requires installing extension binaries and configuring PostgreSQL so `pg_search` can be loaded. That deployment constraint is environment-specific and should not be silently assumed for local Docker, GitHub Actions, or a future managed PostgreSQL provider.

Current decision:

- Preferred lexical engine for future implementation: `pg_search` BM25 when deployability is proven for the target environment.
- Required fallback: PostgreSQL native FTS plus explicit Chinese tokenization/normalization.
- MS-10 must not claim BM25 behavior unless `pg_search` readiness is green in the target environment.

## Native FTS + Chinese Fallback

The fallback path uses PostgreSQL native FTS primitives first:

- Normalize and tokenize Chinese business text before indexing.
- Preserve domain tokens such as process names, material types, approval actions, source path, section, and document title.
- Use `simple` configuration unless a better deployed tokenizer is explicitly proven.
- Pair FTS with metadata filters and quality gates from WT-082.

This is a fallback, not a claim that native PostgreSQL FTS alone segments Chinese text well enough. WT-082 must define cases that catch recall gaps and noise, and MS-10 must store searchable lexical text in a tokenized/normalized form when native FTS is used.

## Filtered pgvector Risk Boundary

Vector retrieval must account for application filters:

- `knowledgeBaseId`
- `sourceId`
- source/snippet enabled status
- future `profileId`

Filtering can shrink candidate sets and reduce recall, especially with approximate indexes. MS-10 should evaluate larger vector `topK`, exact search for small filtered sets, partial indexes, and partitioning before locking implementation behavior.

## WT-082 Handoff

WT-082 should use this readiness baseline to define retrieval evaluation cases that cover:

- lexical-only fallback recall,
- vector candidate recall under filters,
- fused result noise,
- forbidden source exclusion,
- citation traceability.

Extension readiness alone is not a retrieval quality proof.
