# Gate Evidence: WT-20260601-115

## Metadata

- worktrack_id: WT-20260601-115
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `docs/ms14-bm25-candidate-matrix.md` records the BM25 candidate matrix and evaluation plan.
- The matrix covers ParadeDB `pg_search`, Timescale/TigerData `pg_textsearch`, VectorChord-BM25 / `pg_tokenizer`, and Chinese tokenizer/native FTS helpers `zhparser` and `pg_jieba`.
- The plan separates BM25 ranking plugins from tokenizer-only/native FTS helpers.
- The plan defines compatibility gates, Chinese corpus/tokenization checks, performance metrics, accuracy metrics, decision criteria, and worktrack execution mapping for WT-116 through WT-122.
- `.servo/worktrack/WT-20260601-115/contract.md` and `plan-task-queue.md` record the WT-115 research boundary.

## Validation Evidence

- Current upstream/primary docs were checked with web evidence because plugin version/runtime compatibility is time-sensitive.
- `git diff --check`: pass.
- Policy/stale-claim scan over `docs/ms14-bm25-candidate-matrix.md` and WT-115 artifacts found no active claim that BM25 is enabled, native FTS is BM25, or `zhparser` / `pg_jieba` are BM25 ranking engines. The only match was the explicit non-claim that they are not BM25 ranking plugins.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-115-bm25-candidate-matrix`.
- Scope boundary: research/docs only; no candidate images were pulled, no containers started, no extensions created, no default runtime changed, no volumes/cache touched.
- BM25 remains target-runtime candidate behavior only.
- MS-13 default runtime remains the accepted fallback baseline.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
