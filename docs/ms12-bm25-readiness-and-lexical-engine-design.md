# MS-12 BM25 Readiness and Lexical Engine Design

## Metadata

- milestone: MS-12
- worktrack: WT-20260601-102
- updated: 2026-06-01

## Decision

MS-12 keeps `postgres-native-fts-fallback` as the active lexical engine. `pg_search` BM25 remains a target engine, not a runtime capability, until a target PostgreSQL image or managed database proves extension availability and loadability.

PostgreSQL core full-text search is not BM25. The built-in ranking functions are `ts_rank` and `ts_rank_cd`; PostgreSQL documentation also notes that those ranking functions do not use global corpus information. True BM25 in Postgres therefore requires an extension/runtime package rather than a claim about PostgreSQL core.

## Current Readiness

Current local evidence still matches the MS-11 readiness boundary:

- `pgvector` is available in the PostgreSQL 16 / pgvector image.
- Native PostgreSQL FTS works against pre-tokenized Chinese business text with the `simple` configuration.
- `pg_search` is not available in the current local image.
- The application must not label the active path as BM25 while `pg_search` readiness is unavailable.

The concrete reason is the selected runtime image. Local development and CI use `pgvector/pgvector:0.8.2-pg16`, which provides PostgreSQL 16 plus the `vector` extension. It does not bundle or expose ParadeDB's `pg_search` extension, so `pg_available_extensions` reports `vector` but not `pg_search`. In that environment, the safe result is to keep `postgres-native-fts-fallback` active and treat BM25 as a target-runtime capability.

The readiness command remains:

```bash
npm run search:extensions
```

Set `SEARCH_REQUIRE_PG_SEARCH=true` only for a target runtime where BM25 is mandatory. In the current local runtime, that strict mode is expected to fail if `pg_search` is unavailable.

## Lexical Engine Abstraction

The application now has a typed lexical engine descriptor in `src/lib/knowledge/lexical-engines.ts`.

Active engine:

- id: `postgres-native-fts-fallback`
- BM25: no
- current default: yes
- readiness status: active
- runtime claim allowed: yes

Target engine:

- id: `pg-search-bm25`
- BM25: yes
- current default: no
- readiness status: target-runtime-required
- runtime claim allowed: no
- fallback: `postgres-native-fts-fallback`

Retrieval evidence uses the active engine id from this descriptor. Future BM25 implementation should add a real engine path behind the same evidence boundary rather than renaming the fallback path.

## Future BM25 Extension Enablement Requirements

Before a BM25 engine can become active, a separate Worktrack must compare candidate Postgres BM25 extension routes and prove a target runtime. Current candidates to evaluate include:

- ParadeDB `pg_search`: BM25/full-text/faceted search over Postgres tables via Tantivy.
- Timescale/TigerData `pg_textsearch`: BM25 relevance-ranked full-text search with `USING bm25(...)` indexes.
- VectorChord-BM25: native BM25 ranking index/operator extension for PostgreSQL.

Any candidate selected for runtime use must prove:

- target image or managed PostgreSQL environment exposes the chosen BM25 extension in `pg_available_extensions` or provides a documented install path;
- `CREATE EXTENSION <candidate>` succeeds in an isolated readiness database;
- index DDL and representative BM25 query probes pass;
- fallback behavior remains available when the extension is absent;
- retrieval evaluation cases compare BM25, native FTS fallback, vector, and hybrid fusion quality;
- docs and UI/debug evidence clearly distinguish BM25 from native FTS fallback.

Primary references checked during MS-12 acceptance follow-up:

- PostgreSQL text-search ranking: https://www.postgresql.org/docs/current/textsearch-controls.html
- ParadeDB `pg_search`: https://pgxn.org/dist/pg_search/
- Timescale/TigerData `pg_textsearch`: https://github.com/timescale/pg_textsearch
- VectorChord-BM25: https://github.com/tensorchord/VectorChord-bm25

## Anti-Claim Boundary

Until those requirements pass, ReqFlow may say:

- "native PostgreSQL FTS fallback is active";
- "`pg_search` BM25 is a target runtime option";
- "BM25 requires target runtime readiness".

ReqFlow must not say:

- "BM25 is enabled";
- "`pg_search` is the current lexical engine";
- "native FTS fallback is equivalent to BM25".

