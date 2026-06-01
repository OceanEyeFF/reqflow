# MS-14 BM25 Accuracy And Performance Comparison

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-121
- updated: 2026-06-01
- status: comparison report

## Purpose

This report compares the evidence currently available for PostgreSQL BM25
candidate quality in ReqFlow's Chinese retrieval fixtures.

It does not enable BM25, change the default runtime, mutate
`docker-compose.runtime.yml`, or claim production performance. The accepted
runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS
fallback, pgvector, and RRF-style hybrid retrieval.

## Evidence Inputs

| Input | Measurement mode | How it is used |
| --- | --- | --- |
| `docs/ms14-bm25-benchmark-corpus.json` | corpus | Shared WT-116 Chinese benchmark cases and thresholds. |
| `docs/ms14-bm25-benchmark-baseline-results.json` | schema-fixture | Native FTS fallback control shape only; not measured performance. |
| `docs/ms14-paradedb-pg-search-results.json` | measured | ParadeDB `pg_search` BM25 candidate ranking/performance evidence. |
| `docs/ms14-vectorchord-bm25-results.json` | measured | VectorChord-BM25 / `pg_tokenizer` ranking/performance evidence. |
| `docs/ms14-pg-textsearch-compat-results.json` | compatibility only | Availability evidence; excluded from ranking/performance comparison. |
| `docs/retrieval-evaluation-ms10-results.json` | separate MS-10 gate | Existing hybrid retrieval architecture evidence; not same-corpus MS-14 performance evidence. |

## Derived Metric Rules

Metrics are derived from ranked top-k hits, matching
`scripts/bm25-benchmark-gate.mjs`:

- `Recall@5`: expected snippet IDs present in the first five hits.
- `Recall@10`: expected snippet IDs present in the first ten hits.
- `Precision@5`: first five hits that are expected snippets.
- `First relevant rank`: rank of the first expected snippet.

Self-reported metrics are ignored. Raw candidate scores are not compared across
engines because ParadeDB reports positive BM25-style scores, VectorChord reports
negative distance-like values, native FTS uses PostgreSQL ranking functions, and
hybrid retrieval uses RRF-style rank fusion.

## Accuracy Summary

| Candidate | Class | Avg Recall@5 | Avg Recall@10 | Avg Precision@5 | Avg first relevant rank | Gate status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Native FTS fixture | fallback fixture | 1.0000 | 1.0000 | 0.4000 | 1.0000 | fixture gate pass; not measured runtime quality |
| ParadeDB `pg_search` | BM25 measured | 1.0000 | 1.0000 | 0.4000 | 1.1667 | result gate pass |
| VectorChord-BM25 / `pg_tokenizer` | BM25 measured | 0.9444 | 1.0000 | 0.3667 | 1.0000 | result gate expected fail on synonym Recall@5 |
| `pg_textsearch` | BM25 candidate | N/A | N/A | N/A | N/A | excluded; extension unavailable in tested image |

The native fixture appears numerically strong because it is a hand-authored
schema fixture that validates result shape. It is not evidence that native FTS
matches BM25 quality or performance on a live indexed runtime.

## Case-Level Accuracy

| Case | Native fixture Recall@5 | ParadeDB Recall@5 | VectorChord Recall@5 | Relevant observation |
| --- | ---: | ---: | ---: | --- |
| `ms14-consumables-standard-outbound` | 1.0000 | 1.0000 | 1.0000 | Both BM25 candidates ranked the SOP first. |
| `ms14-qc-sampling-mixed-language` | 1.0000 | 1.0000 | 1.0000 | ParadeDB ranked ERP first; VectorChord ranked QC first. Both kept expected snippets in top 5. |
| `ms14-warehouse-responsibility-boundary` | 1.0000 | 1.0000 | 1.0000 | Both BM25 candidates ranked the warehouse boundary snippet first. |
| `ms14-zip-path-source-citation` | 1.0000 | 1.0000 | 1.0000 | Both BM25 candidates ranked the zip source first. |
| `ms14-synonym-qc-sampling` | 1.0000 | 1.0000 | 0.6667 | VectorChord missed `snip-direct-outbound-allowed` in top 5; it ranked 7th. |
| `ms14-negative-disabled-legacy` | 1.0000 | 1.0000 | 1.0000 | Both BM25 candidates excluded the disabled legacy source from top-k. |

## Performance Summary

| Candidate | Measurement mode | Index build ms | Index size bytes | Avg p50 ms | Avg p95 ms | Notes |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Native FTS fixture | schema-fixture | 0 | N/A | 0 | 0 | Placeholder fixture values only. |
| ParadeDB `pg_search` | measured | 346.152 | 3022848 | 158.993 | 168.121 | Local isolated Docker PoC on 12 snippets. |
| VectorChord-BM25 / `pg_tokenizer` | measured | 386.583 | 1433600 | 158.986 | 173.601 | Local isolated Docker PoC on 12 snippets. |
| `pg_textsearch` | compatibility only | N/A | N/A | N/A | N/A | No extension available in tested runtime. |

Both measured BM25 candidates show similar local p50 latency on the compact
fixture. VectorChord's average p95 is higher in this run and its synonym gate
failure is more important than the small p50 difference. These numbers should
not be projected to production, because the fixture has only 12 snippets and no
realistic corpus size, concurrency, cache, storage, or memory pressure.

## Explain And Execution Evidence

| Candidate | Explain signal | Interpretation |
| --- | --- | --- |
| ParadeDB `pg_search` | `Custom Scan (ParadeDB Base Scan)`, `TopKScanExecState`, `pdb.score() desc` | Evidence that the query used ParadeDB's indexed search path in the candidate runtime. |
| VectorChord-BM25 / `pg_tokenizer` | `tokenize(..., 'ms14_jieba')::bm25vector`, `to_bm25query(...)`, `<&>` operator, then sorted scan in the compact fixture | Evidence that tokenizer and BM25 query APIs work; the compact fixture plan still shows sequential scan behavior. |
| Native FTS fixture | No EXPLAIN captured | Not measured runtime evidence. |
| Existing hybrid retrieval | MS-10 result gate includes RRF contribution evidence and no raw score addition | Architecture evidence only; not a same-corpus MS-14 BM25 benchmark. |

## Existing Hybrid Retrieval Evidence

ReqFlow's current hybrid retrieval path is already validated by the MS-10
evaluation gate in `docs/retrieval-evaluation-ms10-results.json`:

- includes `hybrid-fusion`, `vector-only`, `lexical-only`, and `context-window`
  coverage;
- records RRF contribution evidence per fused hit;
- records vector-lane ready and failure states;
- records filter reasons and citation/context-window evidence;
- forbids raw score addition.

That evidence is important because a future BM25 runtime option must integrate
with the same rank-fusion invariant. It is not a same-corpus comparison against
the WT-116 BM25 corpus, so WT-121 does not assign Recall@5 or latency numbers
for "hybrid" in the MS-14 comparison table.

## Candidate Interpretation

### ParadeDB `pg_search`

ParadeDB is the strongest measured BM25 candidate at this point:

- compatibility gate passed in an isolated runtime;
- benchmark result gate passed on all six WT-116 cases;
- average Recall@5 and Recall@10 are both `1.0000`;
- average local p50 is `158.993 ms` on the 12-snippet fixture;
- query plans show ParadeDB base scan/top-k execution evidence.

Caveats:

- current PoC used `pdb.unicode default`, not a final Chinese tokenizer decision;
- runtime implies a database image change from the MS-13 default;
- local performance is too small-scale for capacity planning.

### VectorChord-BM25 / `pg_tokenizer`

VectorChord is a working but deferred candidate:

- compatibility gate passed in an isolated runtime;
- `pg_tokenizer`, `vchord_bm25`, and `vector` all install and coexist;
- average Recall@10 is `1.0000`;
- average local p50 is `158.986 ms` on the 12-snippet fixture.

Caveats:

- benchmark result gate fails because the synonym case Recall@5 is `0.6667`;
- result tokenizer evidence records internal token IDs, not human-readable word
  boundaries;
- adopting it would require tokenizer/query expansion or dictionary tuning
  before it can beat the current fallback/hybrid baseline with confidence.

### `pg_textsearch`

`pg_textsearch` should remain excluded from WT-122 adoption consideration unless
a packaged runtime path is introduced:

- the tested `postgres:18` image does not list the extension;
- `CREATE EXTENSION` was not attempted;
- no index, query, tokenizer, accuracy, or performance result exists.

## WT-122 Recommendation Input

For the final MS-14 decision report:

1. Recommend ParadeDB `pg_search` as the only BM25 candidate that currently
   deserves a future runtime-enablement milestone.
2. Keep VectorChord-BM25 as `defer`, not `reject`, because runtime compatibility
   works but quality/token-audit evidence is not yet sufficient.
3. Keep `pg_textsearch` as `defer` pending a custom package/image and preload
   path.
4. Do not change the default runtime in MS-14.
5. If a future BM25 enablement milestone is opened, require same-corpus hybrid
   comparison, larger corpus performance, rollback documentation, and an
   explicit fdch0 approval point before any default runtime switch.

## Non-Claims

- WT-121 did not run new containers.
- WT-121 did not modify retrieval implementation or runtime compose files.
- WT-121 did not enable BM25.
- WT-121 did not prove production latency or capacity.
- WT-121 did not compare raw scores across BM25, native FTS, vector, or hybrid
  retrieval.
