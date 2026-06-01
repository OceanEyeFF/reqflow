# MS-15 ParadeDB `pg_search` Tokenizer Benchmark

## Metadata

- milestone: MS-15
- worktrack: WT-20260601-125
- updated: 2026-06-01
- status: candidate runtime benchmark measured

## Purpose

WT-125 reruns the MS-14 Chinese BM25 corpus against the MS-15 ParadeDB
candidate compose runtime. This is not the MS-14 throwaway-container PoC and it
does not prove that BM25 is active in the default runtime.

## Runtime Target

The benchmark runner uses:

- compose file: `docker-compose.paradedb.yml`;
- service: `postgres`;
- default database: `reqflow_dev`;
- default user: `reqflow`;
- isolated schema: `ms15_pg_search_benchmark`;
- output: `docs/ms15-paradedb-candidate-benchmark-results.json`.

The runner calls `docker compose exec -T postgres psql`, so it targets the
digest-pinned candidate compose runtime that WT-124 validated. It does not run
`docker run paradedb/paradedb:latest`.

## Commands

Start the candidate PostgreSQL service:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
$env:POSTGRES_PORT = "55437"
docker compose -f docker-compose.paradedb.yml up -d postgres
```

Run the benchmark:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
npm run paradedb:candidate-benchmark
npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json
```

Stop without deleting candidate state:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.paradedb.yml stop postgres
```

## Tokenizer Evidence Boundary

The current measured tokenizer path is `pdb.unicode default`. WT-125 records it
as a candidate-compatible tokenizer, not as final Chinese tokenizer approval.

The result file must include, for every case:

- `tokenizerEvidence.tokenizer`;
- `tokenizerEvidence.segmentationMode`;
- `tokenizerEvidence.queryTokens`;
- `tokenizerEvidence.focusTermBehavior`;
- query latency samples;
- BM25 index build time and size;
- EXPLAIN highlights showing the ParadeDB custom scan.

## Cleanup Boundary

The runner drops and recreates only the isolated benchmark schema
`ms15_pg_search_benchmark`. It must not drop application tables, Docker
volumes, uploads, model cache, or the MS-13 default runtime data.

## Decision Boundary

Passing this benchmark means the candidate runtime can execute the same Chinese
BM25 corpus through `pg_search` with measured latency and EXPLAIN evidence. It
does not switch `docker-compose.runtime.yml`, does not enable BM25 in the
default runtime, and does not change hybrid retrieval fusion.

## Measured Result

Output file:

- `docs/ms15-paradedb-candidate-benchmark-results.json`

Observed candidate runtime facts:

| Item | Value |
| --- | --- |
| PostgreSQL | `18.4 (Debian 18.4-1.pgdg13+1)` |
| `pg_search` | `0.23.5` |
| `vector` | `0.8.1` |
| corpus | 6 cases / 12 snippets |
| BM25 index build | `581.23ms` |
| BM25 index size | `3022848` bytes |
| BM25 result gate | pass |

Case latency summary:

| Case | Top result | p50 | p95 |
| --- | --- | ---: | ---: |
| `ms14-consumables-standard-outbound` | `snip-consumables-standard-inspection` | `289.535ms` | `304.868ms` |
| `ms14-qc-sampling-mixed-language` | `snip-erp-sync-sku` | `272.871ms` | `287.311ms` |
| `ms14-warehouse-responsibility-boundary` | `snip-consumables-warehouse-boundary` | `281.317ms` | `285.737ms` |
| `ms14-zip-path-source-citation` | `snip-zip-path-consumables` | `280.698ms` | `286.694ms` |
| `ms14-synonym-qc-sampling` | `snip-qc-sampling-ratio` | `283.562ms` | `286.703ms` |
| `ms14-negative-disabled-legacy` | `snip-direct-outbound-allowed` | `271.003ms` | `293.002ms` |

Every case recorded EXPLAIN highlights containing `Custom Scan (ParadeDB Base
Scan)`, the `ms15_docs` table, and the `ms15_docs_bm25_idx` index. The observed
query token evidence remains coarse for pure Chinese cases, where several
queries appear as whole phrases. The default tokenizer is therefore
ranking-compatible for this corpus but not final proof of word-level Chinese
segmentation.
