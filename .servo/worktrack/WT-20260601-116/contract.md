# Worktrack Contract: WT-20260601-116

## Metadata

- worktrack_id: WT-20260601-116
- title: 中文检索语料与 BM25 benchmark harness
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 7fab78f588570d5c47924f7b334e76a42ec6267b
- branch: worktrack/wt-20260601-116-bm25-benchmark-harness
- worktree: .worktrees/wt-20260601-116-bm25-benchmark-harness
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: test + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 is active with WT-115 completed; default runtime remains native PostgreSQL FTS fallback plus pgvector and RRF-style hybrid retrieval.
- snapshot_freshness: develop baseline is `7fab78f`, after WT-115 candidate matrix and closeout refresh.
- milestone_purpose_alignment: WT-116 creates the repeatable Chinese corpus and benchmark result contract required before candidate PoCs can be compared.
- historical_conflict_risk: must not claim BM25 is active, must not start candidate containers, and must not mutate default Docker volumes or compose runtime.
- worktrack_adjustment_recommendations: keep this slice focused on fixture/result schema and validation harness; candidate-specific runtime execution belongs to WT-117 through WT-119.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Create a repeatable MS-14 Chinese retrieval corpus and benchmark result gate
that candidate PostgreSQL BM25 plugin PoCs can use to report tokenization,
accuracy, performance, and policy evidence in a comparable format.

## In Scope

- Add a BM25-specific Chinese evaluation corpus covering pure Chinese, mixed Chinese-English, business vocabulary, source/zip paths, synonyms, and negative traps.
- Add a benchmark result gate that validates candidate metadata, tokenizer output, top-k rankings, derived recall/precision/MRR, performance metrics, explain-plan evidence, and non-destructive policy evidence.
- Add an example native-FTS baseline result fixture to prove the gate shape.
- Document how WT-117 through WT-121 should consume the corpus and result format.

## Out Of Scope

- Starting Docker containers or pulling candidate images.
- Creating PostgreSQL extensions or indexes.
- Measuring real candidate latency in this worktrack.
- Changing application retrieval logic.
- Changing the MS-13 default runtime or compose path.
- Deleting volumes/cache/uploads/database state.

## Acceptance Criteria

- `docs/ms14-bm25-benchmark-corpus.json` validates through a new package script.
- The result gate derives Recall@5, Recall@10, Precision@5, and MRR from returned rankings instead of trusting self-reported metrics.
- The gate requires Chinese tokenizer evidence, performance metric shape, explain-plan evidence, and policy evidence for every candidate result.
- A checked-in baseline fixture passes the result gate.
- Documentation explains command usage, result schema, metrics, and boundaries.
- Validation includes syntax checks, the BM25 benchmark gate, existing retrieval gate compatibility, and `git diff --check`.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: test harness and fixture work is tightly coupled to local repo scripts/docs; no candidate runtime execution is required.
