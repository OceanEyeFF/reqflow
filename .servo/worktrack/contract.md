---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-006-runtime-docs-catch-up"
milestone_id: "MS-20260522-002"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-006-runtime-docs-catch-up
- branch: worktrack/WT-20260522-006-runtime-docs-catch-up
- baseline_branch: develop-aw
- baseline_ref: 73d596f
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: ready_for_close

## Node Type

- type: docs
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-002`; WT-004 and WT-005 are closed and merged; baseline branch is `develop-aw`.
- snapshot_freshness: fresh at `73d596f`; repo snapshot and analysis route verified runtime docs catch-up to this worktrack.
- milestone_purpose_alignment: directly satisfies the milestone signal that docs describe the local smoke workflow and avoid unverified production-readiness claims.
- historical_conflict_risk: low because scope is docs-only; risk rises if docs claim unverified production behavior.
- worktrack_adjustment_recommendations: keep as a single docs catch-up slice.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- execution_policy_contract_ref: docs/harness/artifact/worktrack/contract.md#execution-policy
- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- allowed_values: auto / delegated / current-carrier
- fallback_reason_required: yes

## Task Goal

- Update operator-facing docs with the accepted smoke workflow, WT-005 runtime fixes, seed login path, and local runtime caveats.

## Scope

### Control Signal
- Scope summary: Docs-only catch-up for verified runtime smoke and dashboard/ticket flow fixes.

### Supporting Detail
- In scope: README, `docs/handoff.md`, and `.servo/worktrack/*`.
- Out of scope: product code, schema/migration changes, new roadmap commitments, production-readiness claims.

## Acceptance Criteria

### Control Signal
- Core acceptance: operator-facing docs describe how to run and interpret the accepted local smoke workflow.

### Supporting Detail
- README contains setup, validation, smoke coverage, Chrome channel caveat, and worktree workflow.
- `docs/handoff.md` no longer lists WT-005 defects as unresolved and points to WT-006 as the docs catch-up source.
- Validation commands pass after docs update.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- stale-text search for old unresolved WT-005 defect wording
- `git diff --check`

## Notes

- Third worktrack under `MS-20260522-002`.
