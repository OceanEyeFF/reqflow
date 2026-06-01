# Worktrack Contract: WT-20260601-121

## Metadata

- worktrack_id: WT-20260601-121
- title: BM25 vs native FTS vs hybrid retrieval 准确率/性能对比
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 4bbb21858033dec0a2f993149eef590dfd2e7114
- branch: worktrack/wt-20260601-121-bm25-performance-accuracy
- worktree: .worktrees/wt-20260601-121-bm25-performance-accuracy
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: test + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 has candidate matrix, benchmark harness, ParadeDB and VectorChord measured PoCs, pg_textsearch compatibility evidence, and WT-120 tokenizer synthesis.
- snapshot_freshness: develop baseline is `4bbb218`, after WT-120 closeout and repo refresh.
- milestone_purpose_alignment: WT-121 compares rank-derived accuracy and local performance evidence before the final MS-14 decision report.
- historical_conflict_risk: native FTS baseline fixture and MS-10 hybrid evaluation are not measured on the same MS-14 corpus; avoid false apples-to-apples claims.
- worktrack_adjustment_recommendations: derive metrics from checked-in result files and explicitly separate measured BM25 candidate evidence from fixture/non-comparable hybrid evidence.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Produce a repeatable WT-121 comparison report for BM25 candidates, native FTS
baseline fixture, and existing hybrid retrieval evidence, covering accuracy,
local performance, explain-plan evidence, score-comparison boundaries, and
candidate recommendations for WT-122.

## In Scope

- Derive Recall@5, Recall@10, Precision@5, first relevant rank, and average local p50/p95 from MS-14 result files.
- Compare ParadeDB `pg_search` and VectorChord-BM25 / `pg_tokenizer` on the same WT-116 corpus.
- Include native FTS schema-fixture evidence with explicit non-performance caveat.
- Include existing MS-10 hybrid retrieval gate evidence as architecture evidence, not same-corpus performance evidence.
- Preserve raw-score non-comparability and RRF-style fusion boundaries.

## Out Of Scope

- Starting new candidate containers.
- Creating new benchmark thresholds.
- Re-running application retrieval against live databases.
- Modifying retrieval implementation, compose runtime, or default lexical engine.
- Enabling BM25 or recommending a default runtime switch without WT-122.

## Acceptance Criteria

- Report includes derived accuracy metrics for native fixture, ParadeDB, and VectorChord result files.
- Report includes local performance numbers for measured candidates and marks fixture/hybrid gaps honestly.
- Report explains why raw ParadeDB/VectorChord/native/vector scores are not directly comparable.
- Validation includes `npm run bm25:evaluate`, candidate result gates, expected VectorChord gate failure record, retrieval gate for existing MS-10 evidence, `git diff --check`, and policy scan.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: deterministic evidence synthesis over existing artifacts; no new runtime execution required.
