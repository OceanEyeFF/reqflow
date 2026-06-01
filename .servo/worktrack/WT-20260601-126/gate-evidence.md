# Gate Evidence: WT-20260601-126

## Metadata

- worktrack_id: WT-20260601-126
- milestone_id: MS-15
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Added `npm run paradedb:hybrid-comparison`.
- Added `scripts/ms15-paradedb-hybrid-comparison.mjs`.
- Added `docs/ms15-paradedb-hybrid-comparison-results.json`.
- Added `docs/ms15-paradedb-hybrid-comparison.md`.
- Added WT-126 control artifacts.
- Did not start containers or mutate runtime state.
- Did not modify `docker-compose.runtime.yml`.
- Did not implement ParadeDB in app retrieval code.

## Comparison Evidence

- Same-corpus inputs:
  - `docs/ms14-bm25-benchmark-corpus.json`.
  - `docs/ms14-bm25-benchmark-baseline-results.json`.
  - `docs/ms15-paradedb-candidate-benchmark-results.json`.
- Hybrid invariant input:
  - `docs/retrieval-evaluation-ms10-results.json`.
- `npm run paradedb:hybrid-comparison`: pass.

## Derived Metric Evidence

| Lane | Avg Recall@5 | Avg Recall@10 | Avg Precision@5 | Avg first relevant rank | Avg p50 | Avg p95 | EXPLAIN coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Native FTS fixture | `1.0000` | `1.0000` | `0.4000` | `1.0000` | `0ms` | `0ms` | `0.0000` |
| ParadeDB `pg_search` candidate | `1.0000` | `1.0000` | `0.4000` | `1.1667` | `279.831ms` | `290.719ms` | `1.0000` |

- Native FTS remains fixture/control evidence only, not measured runtime latency.
- ParadeDB candidate remains measured candidate-runtime evidence, not default runtime behavior.
- Raw scores were not compared.

## Hybrid Invariant Evidence

- Existing MS-10 retrieval evidence remains separate from the BM25 corpus and is not same-corpus MS-15 performance evidence.
- Covered modes: `context-window`, `hybrid-fusion`, `lexical-only`, `vector-only`.
- Raw score addition: `false`.
- Vector lane evidence includes ready and failure states.
- Failure reasons include embedding provider failure and dimensions mismatch.
- Required future integration invariant: keep lexical/vector scores separate, convert lanes to ranks, and combine through RRF-style contribution evidence.

## Validation Evidence

- `npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms14-bm25-benchmark-baseline-results.json`: pass.
- `npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json`: pass.
- `npm run retrieval:evaluate -- docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json`: pass.
- `node --check scripts/ms15-paradedb-hybrid-comparison.mjs`: pass.
- `npm ci`: pass; Windows cleanup warning did not block install.
- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass.
- `git diff --check`: pass.
- Targeted policy scan: pass; matches are explicit no-claim/no-raw-score-addition boundary statements.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-126-paradedb-hybrid-comparison`.
- No Docker volumes, uploads, model cache, or database state were deleted.
- No local zip corpora were imported.
- Default runtime remains unchanged.
- BM25 remains candidate runtime evidence only.

## Gate Verdict

- comparison-gate: pass
- hybrid-invariant-gate: pass
- validation-gate: pass
- regression-gate: pass
- policy-gate: pass
- final: pass
