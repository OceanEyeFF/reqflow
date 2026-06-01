# MS-14 ParadeDB pg_search Runtime PoC

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-117
- updated: 2026-06-01
- status: candidate PoC passed with caveats

## Scope

This PoC tested ParadeDB `pg_search` in an isolated temporary Docker container.
It did not modify `docker-compose.runtime.yml`, the MS-13 PostgreSQL volume,
uploads, model cache, or application retrieval code.

## Command

```bash
npm run paradedb:poc
```

Default isolated settings:

- image: `paradedb/paradedb:latest`
- host port: `127.0.0.1:55437`
- database: `reqflow_ms14`
- user/password: `reqflow` / `reqflow`
- host data volume: none
- cleanup: temporary container is removed unless `PARADEDB_KEEP_CONTAINER=true`

## Runtime Facts

Observed from `docs/ms14-paradedb-pg-search-results.json`:

- PostgreSQL: `18.4 (Debian 18.4-1.pgdg13+1)`
- `pg_search`: available and installed, version `0.23.5`
- `vector`: available and installed, version `0.8.1`
- BM25 index creation: passed
- index build time on the 12-snippet fixture: `346.152 ms`
- index size on the 12-snippet fixture: `3022848 bytes`

The first probe attempt connected before the ParadeDB Docker entrypoint had
finished its bootstrap restart and hit `FATAL: the database system is shutting
down`. The probe script now waits for the entrypoint completion log before
running SQL.

## Benchmark Result

The generated result file passes the MS-14 benchmark gate:

```bash
node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-paradedb-pg-search-results.json
```

Validated cases:

| Case | Top result | p50 ms | p95 ms | Note |
| --- | --- | ---: | ---: | --- |
| `ms14-consumables-standard-outbound` | `snip-consumables-standard-inspection` | 157.49 | 163.617 | expected SOP first |
| `ms14-qc-sampling-mixed-language` | `snip-erp-sync-sku` | 158.094 | 170.239 | mixed English tokens work, but ERP outranks QC sampling |
| `ms14-warehouse-responsibility-boundary` | `snip-consumables-warehouse-boundary` | 162.135 | 171.77 | responsibility boundary first |
| `ms14-zip-path-source-citation` | `snip-zip-path-consumables` | 163.263 | 166.96 | source path case first |
| `ms14-synonym-qc-sampling` | `snip-qc-sampling-ratio` | 155.97 | 168.443 | synonym explanation ranked second |
| `ms14-negative-disabled-legacy` | `snip-direct-outbound-allowed` | 157.007 | 167.699 | disabled legacy source excluded |

## Chinese Compatibility Notes

- Pure Chinese business terms retrieved expected snippets in top 5/top 10.
- Mixed Chinese-English queries retrieved relevant `QC sampling`, `SKU`, and
  `ERP` snippets.
- Source-path query retrieved the zip-path snippet as rank 1.
- Disabled legacy content was excluded by `enabled = true` filtering.
- Synonym/near-synonym behavior is useful but imperfect: the exact QC sampling
  rule ranked above the synonym explanation for `检验取样` / `QC取样` /
  `检验后出库`.
- The PoC used ParadeDB default tokenizer behavior. It did not yet validate
  `pdb.chinese_compatible`; that belongs in WT-120 tokenization comparison.

## Decision

WT-117 result: `adopt as future runtime candidate` for continued MS-14
evaluation, not for default runtime enablement.

Reason:

- candidate image starts locally;
- `pg_search` and `vector` coexist;
- `CREATE EXTENSION` succeeds;
- BM25 index creation succeeds;
- Chinese benchmark result gate passes;
- operational caveat remains because this path implies PostgreSQL 18 and a
  different database runtime image from the MS-13 default.

## Non-Claims

- ParadeDB is not enabled in the default ReqFlow runtime.
- `docker-compose.runtime.yml` still uses `pgvector/pgvector:0.8.2-pg16`.
- This PoC does not justify migrating existing volumes.
- Local latency on a 12-snippet fixture is not production performance evidence.
