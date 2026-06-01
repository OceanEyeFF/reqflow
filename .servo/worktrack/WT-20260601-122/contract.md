# Worktrack Contract: WT-20260601-122

## Metadata

- worktrack_id: WT-20260601-122
- title: MS-14 决策报告与默认 runtime 建议
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: review
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 9a81d8b563e2368840c1c431b7c5d03da1fccafa
- branch: worktrack/wt-20260601-122-bm25-decision-report
- worktree: .worktrees/wt-20260601-122-bm25-decision-report
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: review + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 has completed candidate matrix, benchmark harness, three candidate PoCs/compatibility checks, tokenizer synthesis, and accuracy/performance comparison.
- snapshot_freshness: develop baseline is `9a81d8b`, after WT-121 closeout and repo refresh.
- milestone_purpose_alignment: WT-122 is the final review worktrack before fdch0 milestone acceptance handback.
- historical_conflict_risk: final report must not silently enable BM25 or rewrite the default Docker runtime.
- worktrack_adjustment_recommendations: state candidate decisions and future enablement conditions, not implementation changes.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Produce the final MS-14 decision report with candidate decisions, default
runtime boundary, future BM25 enablement conditions, rollback expectations, and
final handback evidence for fdch0 acceptance review.

## In Scope

- Summarize all MS-14 evidence from WT-115 through WT-121.
- Decide adopt/defer/reject per BM25 candidate.
- Recommend whether to open a future BM25 runtime enablement milestone.
- State default runtime and approval boundaries explicitly.
- Produce final validation/handback documentation.

## Out Of Scope

- Enabling BM25.
- Changing Docker images, compose files, retrieval implementation, ranking logic, or database schema.
- Running new candidate containers.
- Accepting MS-14 on behalf of fdch0.

## Acceptance Criteria

- Final report states candidate decisions for ParadeDB `pg_search`, VectorChord-BM25 / `pg_tokenizer`, and `pg_textsearch`.
- Final report states whether the default runtime changes now.
- Final report includes validation evidence and remaining risks.
- Validation includes benchmark gates, expected VectorChord candidate-quality failure record, retrieval gate, `git diff --check`, and policy scan.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: final evidence synthesis and handback documentation; no new runtime execution required.
