# Worktrack Contract: WT-20260601-128

## Metadata

- worktrack_id: WT-20260601-128
- title: Runtime path cost/benefit model and decision criteria
- milestone_id: MS-16
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 9509b22c27382da972c2e117a972184ce0468ffd
- branch: worktrack/wt-20260601-128-runtime-cost-benefit
- worktree: .worktrees/wt-20260601-128-runtime-cost-benefit
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: decision-model + evidence-traceability + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-16 is active, MS-15 is accepted, baseline branch is `develop`, and WT-20260601-128 is the first planned MS-16 worktrack.
- snapshot_freshness: control-state, MS-16 artifact, milestone-backlog, worktrack-backlog, and MS-13/MS-14/MS-15 decision docs are sufficient for WT-128 research initialization.
- milestone_purpose_alignment: WT-128 directly serves MS-16 completion signal 1 by creating a scoring model across the three runtime paths.
- historical_conflict_risk: no conflict if this worktrack remains research-only and does not switch runtime defaults or modify data.
- worktrack_adjustment_recommendations: keep WT-128 as planned.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Create a cost, benefit, risk, and decision-criteria model for the three MS-16
runtime paths:

1. keep current PostgreSQL/pgvector plus native FTS fallback default runtime;
2. keep ParadeDB as an optional candidate profile;
3. move toward ParadeDB `pg_search` as the default PostgreSQL runtime.

## In Scope

- Define scoring dimensions and weights.
- Score the three runtime paths using MS-13/MS-14/MS-15 evidence.
- Record expected benefit, expected cost, and best-fit conditions per path.
- Define cross-path decision gates for later MS-16 ADR work.
- Preserve fdch0 as the final selection authority.

## Out Of Scope

- Switching `docker-compose.runtime.yml`.
- Migrating, converting, deleting, or pruning volumes, uploads, caches, or database state.
- Implementing app retrieval changes.
- Claiming BM25 active behavior in the default runtime.
- Making the final MS-16 runtime selection decision.

## Acceptance Criteria

- A decision model document exists and compares all three runtime paths.
- Cost dimensions include engineering, validation, migration/rollback, operations, and developer experience.
- Benefit dimensions include search quality, Chinese compatibility, product capability, and strategic timing.
- The model distinguishes optional ParadeDB from ParadeDB default runtime.
- The model avoids raw-score comparison across retrieval lanes.
- The model names follow-up evidence needed from WT-129 and WT-130.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: WT-128 is a tightly scoped research/evidence synthesis task with no code implementation or parallel execution need.
- fallback_reason: current carrier can safely execute the bounded documentation task in the existing worktree.
