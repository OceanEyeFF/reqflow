# MS-12 BM25 Readiness and Lexical Engine Design

## Metadata

- milestone: MS-12
- worktrack: WT-20260601-102
- updated: 2026-06-01

## Decision

MS-12 keeps `postgres-native-fts-fallback` as the active lexical engine. `pg_search` BM25 remains a target engine, not a runtime capability, until a target PostgreSQL image or managed database proves extension availability and loadability.

## Current Readiness

Current local evidence still matches the MS-11 readiness boundary:

- `pgvector` is available in the PostgreSQL 16 / pgvector image.
- Native PostgreSQL FTS works against pre-tokenized Chinese business text with the `simple` configuration.
- `pg_search` is not available in the current local image.
- The application must not label the active path as BM25 while `pg_search` readiness is unavailable.

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

## Future pg_search Enablement Requirements

Before `pg-search-bm25` can become the active engine, a separate Worktrack must prove:

- target image or managed PostgreSQL environment exposes `pg_search` in `pg_available_extensions`;
- `CREATE EXTENSION pg_search` succeeds in an isolated readiness database;
- index DDL and representative BM25 query probes pass;
- fallback behavior remains available when the extension is absent;
- retrieval evaluation cases compare BM25, native FTS fallback, vector, and hybrid fusion quality;
- docs and UI/debug evidence clearly distinguish BM25 from native FTS fallback.

## Anti-Claim Boundary

Until those requirements pass, ReqFlow may say:

- "native PostgreSQL FTS fallback is active";
- "`pg_search` BM25 is a target runtime option";
- "BM25 requires target runtime readiness".

ReqFlow must not say:

- "BM25 is enabled";
- "`pg_search` is the current lexical engine";
- "native FTS fallback is equivalent to BM25".

