# Gate Evidence: WT-20260601-121

## Metadata

- worktrack_id: WT-20260601-121
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms14-bm25-accuracy-performance-comparison.md`.
- The report derives rank-based accuracy metrics from:
  - `docs/ms14-bm25-benchmark-corpus.json`
  - `docs/ms14-bm25-benchmark-baseline-results.json`
  - `docs/ms14-paradedb-pg-search-results.json`
  - `docs/ms14-vectorchord-bm25-results.json`
- The report incorporates `docs/retrieval-evaluation-ms10-results.json` only as existing hybrid retrieval architecture evidence, not as same-corpus MS-14 performance evidence.
- No new candidate containers were started.
- No runtime implementation, compose file, benchmark threshold, or retrieval behavior was changed.

## Comparison Evidence Summary

- Native FTS fixture: Recall@5 `1.0000`, Recall@10 `1.0000`, Precision@5 `0.4000`; fixture/control only, not measured runtime performance.
- ParadeDB `pg_search`: measured Recall@5 `1.0000`, Recall@10 `1.0000`, Precision@5 `0.4000`, average p50 `158.993 ms`, average p95 `168.121 ms`, index build `346.152 ms`, index size `3022848 bytes`.
- VectorChord-BM25 / `pg_tokenizer`: measured Recall@5 `0.9444`, Recall@10 `1.0000`, Precision@5 `0.3667`, average p50 `158.986 ms`, average p95 `173.601 ms`, index build `386.583 ms`, index size `1433600 bytes`.
- VectorChord candidate-quality failure remains the synonym case: `ms14-synonym-qc-sampling.derivedRecallAt5` fails because one expected snippet ranks 7th.
- `pg_textsearch` is excluded from accuracy/performance comparison because the tested image does not expose the extension.
- Raw scores remain non-comparable across BM25, native FTS, vector, and hybrid retrieval; future fusion must preserve RRF-style rank fusion.

## Validation Evidence

- `npm run bm25:evaluate`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-bm25-benchmark-baseline-results.json`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-paradedb-pg-search-results.json`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-vectorchord-bm25-results.json`: expected fail on `ms14-synonym-qc-sampling.derivedRecallAt5`.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json`: pass.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit no-enable/no-default-runtime-switch boundaries.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-121-bm25-performance-accuracy`.
- `docker-compose.runtime.yml` was not modified.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- BM25 remains candidate evidence only; WT-121 does not recommend or enable a default runtime switch.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass with expected VectorChord candidate-quality failure recorded
- policy-gate: pass
- final: pass
