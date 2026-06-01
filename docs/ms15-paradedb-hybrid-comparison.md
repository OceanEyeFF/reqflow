# MS-15 ParadeDB Hybrid Comparison

## Metadata

- milestone: MS-15
- worktrack: WT-20260601-126
- updated: 2026-06-01
- status: comparison report

## Purpose

This report compares the measured MS-15 ParadeDB `pg_search` lexical lane with
the existing same-corpus native FTS fixture and the already accepted hybrid
retrieval invariants.

It does not enable BM25 in the default runtime, does not change application
retrieval code, and does not compare raw scores across engines.

## Evidence Inputs

| Input | Same corpus | Measurement mode | Use |
| --- | --- | --- | --- |
| `docs/ms14-bm25-benchmark-corpus.json` | yes | corpus | Shared Chinese lexical benchmark. |
| `docs/ms14-bm25-benchmark-baseline-results.json` | yes | schema fixture | Native FTS fallback shape/control evidence only. |
| `docs/ms15-paradedb-candidate-benchmark-results.json` | yes | measured | ParadeDB candidate compose lexical-lane evidence. |
| `docs/retrieval-evaluation-ms10-results.json` | no | measured/fixture gate | Hybrid RRF and no-raw-score-addition invariant evidence. |
| `docs/ms15-paradedb-hybrid-comparison-results.json` | derived | synthesis | WT-126 machine-readable comparison. |

## Lexical Same-Corpus Summary

| Lane | Avg Recall@5 | Avg Recall@10 | Avg Precision@5 | Avg first relevant rank | Avg p50 | Avg p95 | EXPLAIN coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Native FTS fixture | `1.0000` | `1.0000` | `0.4000` | `1.0000` | `0ms` | `0ms` | `0.0000` |
| ParadeDB `pg_search` candidate | `1.0000` | `1.0000` | `0.4000` | `1.1667` | `279.831ms` | `290.719ms` | `1.0000` |

The native FTS fixture remains a shape/control artifact. Its zero latency and
missing EXPLAIN are not runtime performance evidence. ParadeDB is the measured
candidate runtime lane and shows actual ParadeDB custom-scan plans for every
case.

## Case-Level Notes

| Case | Native top result | ParadeDB top result | Note |
| --- | --- | --- | --- |
| `ms14-consumables-standard-outbound` | `snip-consumables-standard-inspection` | `snip-consumables-standard-inspection` | Same top hit. |
| `ms14-qc-sampling-mixed-language` | `snip-qc-sampling-ratio` | `snip-erp-sync-sku` | Both pass expected top-5 coverage; ordering differs. |
| `ms14-warehouse-responsibility-boundary` | `snip-consumables-warehouse-boundary` | `snip-consumables-warehouse-boundary` | Same top hit. |
| `ms14-zip-path-source-citation` | `snip-zip-path-consumables` | `snip-zip-path-consumables` | Same top hit and citation/source-path coverage. |
| `ms14-synonym-qc-sampling` | `snip-quality-synonym-sampling` | `snip-qc-sampling-ratio` | Both pass Recall@5; synonym ordering differs. |
| `ms14-negative-disabled-legacy` | `snip-direct-outbound-allowed` | `snip-direct-outbound-allowed` | Disabled legacy source is not returned. |

## Hybrid Invariant Evidence

Existing MS-10 hybrid evidence remains valid for architecture invariants:

- modes covered: `context-window`, `hybrid-fusion`, `lexical-only`, `vector-only`;
- raw score addition: `false`;
- vector lane states include ready and failure cases;
- failure reasons include provider failure and dimensions mismatch;
- context-window evidence remains bounded.

This is not a same-corpus MS-15 hybrid performance measurement. WT-126 therefore
does not assign Recall@5 or latency numbers to a ParadeDB hybrid lane inside the
application. A later implementation worktrack would need to wire ParadeDB as the
lexical lane and then rerun the retrieval gate before claiming application-level
hybrid performance.

## Interpretation

ParadeDB `pg_search` is compatible with the current hybrid retrieval design
because the lexical lane produces ranked hits with stable snippet/source IDs,
and the accepted hybrid design fuses ranks rather than raw scores.

The required integration invariant is:

- keep lexical and vector scores separate;
- convert lanes to ranks;
- combine via RRF-style contribution evidence;
- preserve selected knowledge-base scope, disabled-source filtering, citation
  traceability, and context window limits.

## Non-Claims

- WT-126 did not change runtime defaults.
- WT-126 did not implement ParadeDB in app retrieval code.
- WT-126 did not run embedding model quality tests.
- WT-126 did not import local zip corpora.
- WT-126 did not measure same-corpus ParadeDB hybrid application performance.
