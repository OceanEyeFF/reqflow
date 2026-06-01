# Gate Evidence: WT-20260601-122

## Metadata

- worktrack_id: WT-20260601-122
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms14-final-decision-report.md`.
- The report synthesizes MS-14 evidence from WT-20260601-115 through WT-20260601-121.
- Candidate decisions:
  - ParadeDB `pg_search`: adopt as future runtime-enablement candidate.
  - VectorChord-BM25 / `pg_tokenizer`: defer.
  - `pg_textsearch`: defer.
  - Native PostgreSQL FTS fallback: keep as current default fallback; not BM25.
- The report explicitly states that MS-14 does not change the default runtime and that fdch0 approval is required before any runtime switch.
- No new candidate containers were started.
- No runtime implementation, compose file, benchmark threshold, schema, or retrieval behavior was changed.

## Validation Evidence

- `npm run bm25:evaluate`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-paradedb-pg-search-results.json`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-bm25-benchmark-baseline-results.json`: pass.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-vectorchord-bm25-results.json`: expected fail on `ms14-synonym-qc-sampling.derivedRecallAt5`.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json`: pass.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit no-enable/no-default-runtime-switch/no-migration-permission boundaries.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-122-bm25-decision-report`.
- `docker-compose.runtime.yml` was not modified.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- BM25 remains candidate evidence only; WT-122 does not recommend enabling BM25 inside MS-14.
- MS-14 final acceptance remains fdch0-only.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass with expected VectorChord candidate-quality failure recorded
- policy-gate: pass
- final: pass; MS-14 ready for fdch0 acceptance review
