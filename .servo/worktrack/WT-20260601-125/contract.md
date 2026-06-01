# Worktrack Contract: WT-20260601-125

## Metadata

- worktrack_id: WT-20260601-125
- title: pg_search integration probe, tokenizer selection, and Chinese benchmark rerun
- milestone_id: MS-15
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 7b141ed
- branch: worktrack/wt-20260601-125-paradedb-pg-search-tokenizer
- worktree: .worktrees/wt-20260601-125-paradedb-pg-search-tokenizer
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: candidate-runtime-benchmark + tokenizer-evidence + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-15 is active and WT-124 proved the candidate ParadeDB compose can run Prisma, seed, readiness, strict `pg_search`, and web smoke.
- snapshot_freshness: develop baseline is `7b141ed`, after WT-20260601-124 repo refresh.
- milestone_purpose_alignment: WT-125 moves from runtime smoke to the actual `pg_search` index/query path, tokenizer evidence, and Chinese BM25 benchmark on the MS-15 candidate runtime.
- historical_conflict_risk: MS-14 ParadeDB evidence used an isolated temporary container and `latest`; WT-125 must not reuse that as runtime replacement evidence without rerunning on the candidate compose/digest runtime.
- worktrack_adjustment_recommendations: use an isolated schema/table/index inside the candidate DB and drop only that schema during cleanup.
- add_remove_worktrack_recommendations: none at intake.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Rerun the Chinese BM25 benchmark and `pg_search` integration probe against the
MS-15 ParadeDB candidate runtime, recording tokenizer behavior, latency, index
build, and EXPLAIN evidence without changing the default runtime.

## In Scope

- Add or adapt a benchmark script that targets the candidate compose database instead of starting a throwaway container.
- Use the MS-14 Chinese BM25 benchmark corpus.
- Create `pg_search` and `vector` extensions if needed in the candidate database.
- Create an isolated benchmark schema/table/index and run `pg_search` BM25 queries.
- Record tokenizer evidence for the current ParadeDB default tokenizer path.
- Generate a MS-15 result JSON and a concise interpretation doc.
- Run the BM25 result gate, lint/test/build, and policy scan.
- Start/stop candidate compose services non-destructively if needed.

## Out Of Scope

- Switching default runtime to ParadeDB.
- Changing app retrieval implementation or RRF fusion.
- Importing large production/local zip corpora.
- Deleting Docker volumes, uploads, model cache, or database state.
- Testing VectorChord-BM25, `pg_textsearch`, or external search services.
- Treating `pdb.unicode default` as final Chinese tokenizer approval.

## Acceptance Criteria

- Candidate runtime benchmark result passes `npm run bm25:evaluate -- <corpus> <result>`.
- Result file records measured latency, index build time, index size, tokenizer evidence, and EXPLAIN evidence for each case.
- `pg_search` query path uses the candidate compose runtime/digest, not a throwaway `latest` container.
- Cleanup is limited to isolated benchmark schema objects.
- Documentation states whether the default tokenizer is acceptable, caveated, or needs follow-up.
- `npm run lint`, `npm run test`, and `npm run build` pass or blockers are recorded.
- No docs claim BM25 is active in the default runtime.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier with explorer sidecar
- decision_inputs: current carrier owns script/doc edits and runtime benchmark; explorer sidecar performs read-only reuse/risk analysis.
- fallback_reason: benchmark implementation and evidence capture are tightly coupled to local runtime state.
