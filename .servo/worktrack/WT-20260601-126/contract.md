# Worktrack Contract: WT-20260601-126

## Metadata

- worktrack_id: WT-20260601-126
- title: Same-corpus hybrid retrieval comparison with ParadeDB lexical lane
- milestone_id: MS-15
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: f949df5
- branch: worktrack/wt-20260601-126-paradedb-hybrid-comparison
- worktree: .worktrees/wt-20260601-126-paradedb-hybrid-comparison
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: comparison-evidence + hybrid-invariant + policy
- if_interrupted_strategy: checkpoint-or-recover

## Goal

Compare the MS-15 ParadeDB `pg_search` lexical lane against existing same-corpus
fallback fixture evidence and the accepted hybrid retrieval invariants, without
inventing same-corpus hybrid performance numbers that were not measured.

## In Scope

- Derive same-corpus metrics from `docs/ms14-bm25-benchmark-corpus.json`, `docs/ms14-bm25-benchmark-baseline-results.json`, and `docs/ms15-paradedb-candidate-benchmark-results.json`.
- Cross-reference existing MS-10 hybrid retrieval evidence for RRF/no-raw-score-addition invariants.
- Produce a machine-readable MS-15 comparison result and a concise report.
- Validate the comparison artifact and existing retrieval/BM25 gates.
- Preserve the explicit boundary that default runtime remains unchanged.

## Out Of Scope

- Implementing ParadeDB into application retrieval code.
- Running real embedding model quality tests.
- Importing local zip corpora.
- Switching default runtime or changing fusion strategy.
- Comparing raw scores across lexical/vector/hybrid lanes.
- Claiming same-corpus hybrid latency unless it is actually measured.

## Acceptance Criteria

- Comparison result records per-case Recall@5, Recall@10, Precision@5, first relevant rank, latency, EXPLAIN availability, and measurement mode.
- Report states ParadeDB same-corpus lexical evidence separately from MS-10 hybrid architecture evidence.
- Report confirms RRF-style fusion invariant and no raw score addition remain required.
- `npm run bm25:evaluate` passes for baseline fixture and ParadeDB candidate result.
- `npm run retrieval:evaluate` passes for existing MS-10 retrieval evidence.
- `npm run lint`, `npm run test`, and `npm run build` pass or blockers are recorded.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: comparison is artifact synthesis from existing verified results; no runtime container is required.
- fallback_reason: no parallel implementation slice needed.
