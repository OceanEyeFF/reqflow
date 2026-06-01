# MS-14 VectorChord-BM25 / pg_tokenizer Runtime PoC

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-118
- updated: 2026-06-01
- status: candidate PoC completed; benchmark gate failed on synonym recall

## Scope

This PoC tested VectorChord-BM25 with `pg_tokenizer` in an isolated temporary
Docker container. It did not modify `docker-compose.runtime.yml`, the MS-13
PostgreSQL volume, uploads, model cache, or application retrieval code.

## Command

```bash
npm run vectorchord:poc
```

Default isolated settings:

- image: `tensorchord/vchord-suite:pg18-latest`
- host port: `127.0.0.1:55439`
- database: `reqflow_ms14`
- user/password: `reqflow` / `reqflow`
- host data volume: none
- cleanup: temporary container is removed unless `VECTORCHORD_KEEP_CONTAINER=true`

## Runtime Facts

Observed from `docs/ms14-vectorchord-bm25-results.json`:

- PostgreSQL: `18.3 (Debian 18.3-1.pgdg12+1)`
- `pg_tokenizer`: available and installed, version `0.1.1`
- `vchord_bm25`: available and installed, version `0.3.0`
- `vector`: available and installed, version `0.8.2`
- `CREATE EXTENSION pg_tokenizer CASCADE`: passed
- `CREATE EXTENSION vchord_bm25 CASCADE`: passed
- `CREATE EXTENSION vector CASCADE`: passed
- BM25 index creation: passed
- index build time on the 12-snippet fixture: `386.583 ms`
- index size on the 12-snippet fixture: `1433600 bytes`

The first query attempt used an incompatible function call shape:
`bm25query(regclass, integer[])`. The installed extension exposes
`to_bm25query(regclass, bm25vector)`, so the probe now casts tokenizer output
with `tokenize(...)::bm25vector` and calls `to_bm25query(...)`.

## Benchmark Result

The generated result file does not pass the MS-14 benchmark gate:

```bash
node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-vectorchord-bm25-results.json
```

Failure:

```text
ms14-synonym-qc-sampling.derivedRecallAt5 must be a number between 1 and 1.
```

The synonym case expected:

- `snip-quality-synonym-sampling`
- `snip-consumables-standard-inspection`
- `snip-direct-outbound-allowed`

VectorChord returned the first two in top 5, but `snip-direct-outbound-allowed`
ranked 7th.

Observed top results:

| Case | Top result | p50 ms | p95 ms | Note |
| --- | --- | ---: | ---: | --- |
| `ms14-consumables-standard-outbound` | `snip-consumables-standard-inspection` | 163.443 | 167.012 | expected SOP first |
| `ms14-qc-sampling-mixed-language` | `snip-qc-sampling-ratio` | 152.022 | 173.773 | QC sampling first |
| `ms14-warehouse-responsibility-boundary` | `snip-consumables-warehouse-boundary` | 157.67 | 173.834 | responsibility boundary first |
| `ms14-zip-path-source-citation` | `snip-zip-path-consumables` | 164.465 | 177.88 | source path case first |
| `ms14-synonym-qc-sampling` | `snip-quality-synonym-sampling` | 153.913 | 175.086 | synonym explanation first, but one expected related snippet ranked 7 |
| `ms14-negative-disabled-legacy` | `snip-consumables-standard-inspection` | 162.4 | 174.023 | disabled legacy source excluded |

## Chinese Compatibility Notes

- The `pg_tokenizer` + jieba analyzer setup works and produces usable
  `bm25vector` values for Chinese text.
- Pure Chinese, mixed Chinese-English, source-path, and disabled-source cases
  retrieved relevant top results.
- The synonym case shows recall weakness under the current tokenizer/query
  configuration: `检验后出库` did not pull the direct-outbound rule into top 5.
- This may be tunable with analyzer configuration, synonym dictionaries, query
  expansion, or hybrid fusion, but that is outside WT-118.

## Decision

WT-118 result: `defer`.

Reason:

- candidate image starts locally;
- required extensions are available and create successfully;
- tokenizer and BM25 index setup are reproducible;
- query API works after adapting to installed function signatures;
- MS-14 benchmark result gate does not pass under the current configuration;
- adopting this candidate would require tokenizer/query tuning beyond this PoC.

## Non-Claims

- VectorChord-BM25 is not enabled in the default ReqFlow runtime.
- `docker-compose.runtime.yml` still uses `pgvector/pgvector:0.8.2-pg16`.
- This PoC does not justify migrating existing volumes.
- Local latency on a 12-snippet fixture is not production performance evidence.
