# Gate Evidence: WT-20260601-116

## Metadata

- worktrack_id: WT-20260601-116
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms14-bm25-benchmark-corpus.json` with 6 Chinese BM25 benchmark cases and 12 snippets.
- Corpus coverage includes pure Chinese business terms, mixed Chinese-English terms, source/zip path evidence, synonym/near-synonym queries, disabled legacy traps, citation/source traceability, and ReqFlow warehouse/QC vocabulary.
- Added `scripts/bm25-benchmark-gate.mjs` and `npm run bm25:evaluate`.
- The gate validates corpus shape, candidate run metadata, extension status, tokenizer evidence, top-k rankings, derived Recall@5, Recall@10, Precision@5, first relevant rank, query performance fields, index performance fields, EXPLAIN evidence, and non-destructive policy evidence.
- The gate uses fixed top-5 precision and requires at least 5 ranked hits per case so candidates cannot inflate Precision@5 by returning too few hits.
- Added `docs/ms14-bm25-benchmark-baseline-results.json` as a schema fixture for the current native FTS baseline format.
- Added `docs/ms14-bm25-benchmark-harness.md` documenting commands, result contract, metrics, measurement modes, candidate usage, and non-claim boundaries.

## Validation Evidence

- `node --check scripts/bm25-benchmark-gate.mjs`: pass.
- JSON parse check for corpus and baseline result fixture: pass.
- `npm run bm25:evaluate`: pass; 6 cases and 12 snippets validated.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-bm25-benchmark-baseline-results.json`: pass; 6 baseline fixture results validated.
- `npm run retrieval:evaluate`: pass; existing MS-9/MS-10 retrieval corpus gate remains compatible.
- `git diff --check`: pass.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-116-bm25-benchmark-harness`.
- No Docker containers were started.
- No candidate images were pulled.
- No PostgreSQL extensions were created.
- No default runtime, compose path, volumes, uploads, model cache, or local database state were changed.
- Documentation explicitly states that this harness does not enable BM25 and PostgreSQL native FTS is not BM25.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
