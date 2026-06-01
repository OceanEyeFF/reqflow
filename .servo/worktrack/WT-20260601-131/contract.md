# Worktrack Contract: WT-20260601-131

## Metadata

- worktrack_id: WT-20260601-131
- title: Runtime selection ADR and fdch0 decision gate
- milestone_id: MS-16
- derived_from_milestone: true
- node_type: review
- status: active
- created: 2026-06-02
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 46da259f70165a14be5305bcd9f22752d180b28f
- branch: worktrack/wt-20260601-131-runtime-selection-adr
- worktree: .worktrees/wt-20260601-131-runtime-selection-adr
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: adr + decision-gate + final-handback + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-16 is active and WT-128 through WT-130 are completed with gate evidence.
- snapshot_freshness: current MS-16 evidence is sufficient for final ADR synthesis.
- milestone_purpose_alignment: WT-131 directly satisfies MS-16 completion signals 4, 5, and 6.
- historical_conflict_risk: no conflict if final selection remains pending fdch0 and no implementation is performed.
- worktrack_adjustment_recommendations: keep WT-131 as planned.
- add_remove_worktrack_recommendations: none before fdch0 decision.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Synthesize the option comparison into a decision ADR with recommendation,
confidence, residual risks, follow-up implementation worktracks if ParadeDB
default wins, and explicit fdch0 final decision boundary.

## In Scope

- Write final runtime selection ADR.
- Write MS-16 final handback.
- Record final gate evidence.
- Preserve fdch0 decision boundary.

## Out Of Scope

- Switching default runtime.
- Migrating data or deleting state.
- Implementing app retrieval.
- Creating the follow-up implementation milestone before fdch0 decides.

## Acceptance Criteria

- ADR recommends keep / optionalize / switch direction and states confidence.
- Follow-up implementation worktracks are defined if ParadeDB default direction wins.
- fdch0 decision choices are explicit.
- No doc claims BM25 active behavior.
- MS-16 remains pending fdch0 final acceptance.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: final ADR synthesis is a bounded review/documentation task using verified MS-16 evidence.
- fallback_reason: no separate implementation slice needed.
