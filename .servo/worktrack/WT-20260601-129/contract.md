# Worktrack Contract: WT-20260601-129

## Metadata

- worktrack_id: WT-20260601-129
- title: ParadeDB default-runtime migration impact and rollback cost
- milestone_id: MS-16
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-02
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 05848e95829b04fe3fe635e9574273a9ad9247c5
- branch: worktrack/wt-20260601-129-paradedb-migration-rollback-cost
- worktree: .worktrees/wt-20260601-129-paradedb-migration-rollback-cost
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: migration-impact + rollback-cost + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-16 is active, WT-128 is completed, and WT-129 is the next planned MS-16 research worktrack.
- snapshot_freshness: control-state checkpoint matches current baseline; MS-13/MS-15 runtime docs and compose files are sufficient for migration impact analysis.
- milestone_purpose_alignment: WT-129 directly satisfies MS-16 completion signal 2 by estimating ParadeDB default-runtime migration and rollback cost.
- historical_conflict_risk: no conflict if analysis remains research-only and does not modify runtime defaults or data.
- worktrack_adjustment_recommendations: keep WT-129 as planned.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Estimate the default runtime switch impact from MS-13/MS-15 to ParadeDB,
including compose/image changes, Prisma/migration behavior, volume/data
handling, rollback path, operator runbook deltas, and pre-production risk
modifiers without performing the switch.

## In Scope

- Compare current default and ParadeDB candidate runtime deltas.
- Estimate fresh-data, logical dump/restore, and direct-volume-reuse options.
- Define rollback model and risk register.
- Recommend which migration approach should feed the final MS-16 ADR.

## Out Of Scope

- Editing `docker-compose.runtime.yml`.
- Migrating or converting existing local/production volumes.
- Deleting Docker volumes, uploads, model cache, or DB state.
- Implementing app retrieval changes.
- Making fdch0's final runtime decision.

## Acceptance Criteria

- Migration and rollback costs are explicitly estimated.
- The report distinguishes pre-production acceptable risks from production blockers.
- Direct volume reuse is assessed and either rejected or given clear prerequisites.
- Rollback remains non-destructive.
- The report states which later implementation work would be needed before any runtime switch.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: WT-129 is a bounded research and evidence synthesis task; no code implementation is required.
- fallback_reason: current carrier can execute the documentation-only task safely in a dedicated worktree.
