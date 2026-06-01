# MS-13 BM25 Runtime Feasibility

## Metadata

- milestone: MS-13
- worktrack: WT-20260601-111
- updated: 2026-06-01

## Decision

Keep the MS-13 runtime bundle on `pgvector/pgvector:0.8.2-pg16` plus
`postgres-native-fts-fallback`.

Do not switch the default Docker runtime to a BM25-capable PostgreSQL image in
this worktrack. The current bundle already proves web + PostgreSQL/pgvector +
optional embedding sidecar. Replacing the database image now would broaden the
risk surface into data-directory compatibility, extension preload settings,
licensing/support review, query/index implementation, and retrieval quality
regression.

## Candidate Comparison

| Candidate | Runtime path | PostgreSQL baseline | Strength | Blocking concern for this milestone |
| --- | --- | --- | --- | --- |
| ParadeDB `pg_search` | ParadeDB Docker image or installing `pg_search` into self-managed Postgres | ParadeDB docs describe Docker images and extension install paths; preinstalled extensions include `pg_search` and `pgvector` | Full-text/hybrid search with BM25 and richer search features | Swapping from `pgvector/pgvector` to `paradedb/paradedb` changes the DB runtime distribution and requires a migration/compatibility worktrack before defaulting. |
| Timescale/TigerData `pg_textsearch` | Prebuilt binaries or source build | Current upstream README says PostgreSQL 17 and 18 | BM25 ranked text search with `USING bm25(...)`, top-k focus, production-ready status | Current ReqFlow runtime is PostgreSQL 16, so adopting it implies a Postgres major-version move plus `shared_preload_libraries` and restart handling. |
| VectorChord-BM25 | `tensorchord/vchord-suite` image or extension install | Suite image currently exposes PostgreSQL 17/18 style tags | Native BM25 index/operator plus `pg_tokenizer`, pairs naturally with hybrid retrieval | Requires a different DB image/suite, tokenizer setup, and query/index integration; not a drop-in replacement for current pgvector image. |

## Current Runtime Probe

`npm run search:extensions` now reports BM25 candidates in addition to `vector`.
The command still passes when no BM25 candidate exists because native PostgreSQL
FTS fallback remains the supported local path.

New strict mode:

```bash
SEARCH_REQUIRE_BM25_EXTENSION=true npm run search:extensions
```

Use this only when validating a target image that is expected to expose at least
one BM25 candidate (`pg_search`, `pg_textsearch`, `vchord_bm25`, or the
associated `pg_tokenizer`). `SEARCH_REQUIRE_PG_SEARCH=true` remains available
for environments specifically expected to expose ParadeDB `pg_search`.

## Packaging Recommendation

MS-13 should package the current runtime as:

- default PostgreSQL image: `pgvector/pgvector:0.8.2-pg16`
- active lexical engine: `postgres-native-fts-fallback`
- required vector extension: `vector`
- BM25 status: target-runtime research, not active runtime behavior

For a future BM25 enablement milestone, prefer a side-by-side candidate branch
or explicit alternate compose file instead of modifying `docker-compose.runtime.yml`
in place. That future work must prove:

1. fresh data volume compatibility or documented migration path;
2. extension availability through `pg_available_extensions`;
3. required preload/restart settings;
4. `CREATE EXTENSION` in an isolated readiness database;
5. index DDL and representative BM25 query probes;
6. retrieval quality comparison against native FTS fallback and existing hybrid fusion;
7. rollback path to `pgvector/pgvector:0.8.2-pg16`.

## Anti-Claim Boundary

Allowed claims:

- "MS-13 packages native PostgreSQL FTS fallback and pgvector."
- "BM25 candidate images/extensions have been identified."
- "Strict readiness can require a BM25 candidate in a future target image."

Forbidden claims:

- "BM25 is enabled in the default runtime bundle."
- "`pg_search`, `pg_textsearch`, or `vchord_bm25` is active in ReqFlow."
- "PostgreSQL native FTS is BM25."

## Sources Checked

- ParadeDB deploy docs: https://docs.paradedb.com/deploy/overview
- ParadeDB extension docs: https://docs.paradedb.com/deploy/self-hosted/extension
- ParadeDB third-party extension docs: https://docs.paradedb.com/deploy/third-party-extensions
- Timescale `pg_textsearch`: https://github.com/timescale/pg_textsearch
- PostgreSQL announcement for `pg_textsearch` v1.0: https://www.postgresql.org/about/news/pg_textsearch-v10-3264/
- VectorChord-BM25: https://github.com/tensorchord/VectorChord-bm25
- EDB VectorChord-BM25 docs: https://www.enterprisedb.com/docs/pg_extensions/vectorchord_bm25/
