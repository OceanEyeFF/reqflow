# Gate Evidence: WT-20260601-120

## Metadata

- worktrack_id: WT-20260601-120
- milestone_id: MS-14
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms14-chinese-tokenization-evaluation.md`.
- The report synthesizes tokenizer evidence from:
  - `docs/ms14-bm25-benchmark-corpus.json`
  - `docs/ms14-bm25-benchmark-baseline-results.json`
  - `docs/ms14-paradedb-pg-search-results.json`
  - `docs/ms14-vectorchord-bm25-results.json`
  - `docs/ms14-pg-textsearch-compat-results.json`
- No new candidate containers were started.
- No runtime implementation, compose file, benchmark threshold, or retrieval behavior was changed.

## Tokenization Evidence Summary

- ParadeDB `pg_search`: measured candidate, `pdb.unicode default`, readable mixed tokens, all six corpus cases met required top-k relevance windows; caveat is coarse pure-Chinese token evidence.
- VectorChord-BM25 / `pg_tokenizer`: measured candidate, `ms14_jieba`, working BM25 query/index path; caveat is non-human-readable token IDs and the synonym Recall@5 miss recorded by WT-118.
- `pg_textsearch`: no tokenizer result because the tested `postgres:18` image did not expose the extension.
- Native FTS baseline: schema fixture only, `postgres-simple`, not BM25 and not measured performance evidence.

## Validation Evidence

- JSON sanity checks: pass.
  - Parsed `docs/ms14-bm25-benchmark-corpus.json`, baseline fixture results, ParadeDB results, VectorChord results, and `pg_textsearch` compatibility results.
  - Verified baseline, ParadeDB, and VectorChord result files each cover all six WT-116 corpus cases.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit `BM25 enabled: false`, "does not enable BM25 in the default runtime", and candidate-evidence-only boundaries.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-120-chinese-tokenization-eval`.
- `docker-compose.runtime.yml` was not modified.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- BM25 remains candidate evidence only; WT-120 does not recommend or enable a default runtime switch.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
