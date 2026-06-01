# Worktrack Contract: WT-20260601-130

## Metadata

- worktrack_id: WT-20260601-130
- title: App retrieval integration impact and expected product benefit
- milestone_id: MS-16
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-02
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: df19cf39710c809d89dea359cd0e771f61e0300c
- branch: worktrack/wt-20260601-130-app-retrieval-benefit
- worktree: .worktrees/wt-20260601-130-app-retrieval-benefit
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: integration-impact + product-benefit + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-16 is active, WT-128 and WT-129 are completed, and WT-130 is the next planned MS-16 research worktrack.
- snapshot_freshness: control-state checkpoint matches current baseline; app retrieval code, lexical engine metadata, tests, and MS-15 hybrid comparison docs are sufficient for WT-130.
- milestone_purpose_alignment: WT-130 directly satisfies MS-16 completion signal 3 by estimating app retrieval integration scope and product benefit.
- historical_conflict_risk: no conflict if this worktrack stays research-only and does not implement app retrieval or switch runtime.
- worktrack_adjustment_recommendations: keep WT-130 as planned.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Estimate the scope and expected benefit of wiring ParadeDB `pg_search` into the
app lexical lane while preserving RRF-style fusion, permission filters,
citations, Chinese benchmark assumptions, and no raw-score addition.

## In Scope

- Identify app retrieval files likely affected by future implementation.
- Estimate integration cost and product benefit.
- Define future validation gates.
- Preserve MS-16 decision boundary.

## Out Of Scope

- Implementing a ParadeDB adapter.
- Changing active lexical engine constants.
- Adding Prisma migrations.
- Switching default runtime.
- Running ParadeDB containers or migrating data.

## Acceptance Criteria

- Current retrieval implementation and RRF boundary are traced to concrete files.
- Future app integration files and validation commands are identified.
- Product benefit is estimated separately from runtime availability.
- Report states that runtime switch alone is not enough to claim BM25 app behavior.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: explorer-plus-current-carrier
- decision_inputs: a read-only Explorer inspected app retrieval code while current carrier wrote the bounded WT-130 research artifacts.
- fallback_reason: no app implementation was performed; current carrier integrated the Explorer evidence into a docs-only worktrack.
