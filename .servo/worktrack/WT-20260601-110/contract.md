# Worktrack Contract: WT-20260601-110

## Metadata

- worktrack_id: WT-20260601-110
- title: Migrate/seed/readiness/probe 编排脚本
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 66de24965a31ceb09dae23fe0946db89fd5b7748
- branch: worktrack/wt-20260601-110-runtime-orchestration
- worktree: .worktrees/wt-20260601-110-runtime-orchestration
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is active; WT-108 and WT-109 completed web image and compose bundle.
- snapshot_freshness: develop baseline includes WT-109 closeout at `66de249`; MS-13 progress is 2/6.
- milestone_purpose_alignment: WT-110 adds safe runtime smoke orchestration for migrate, seed, readiness, web HTTP smoke, and optional embedding probe.
- historical_conflict_risk: orchestration must not start/stop/delete containers or volumes by default; migration/seed must remain explicit operator actions.
- worktrack_adjustment_recommendations: implement one local smoke script and docs; leave final manual runbook polish to WT-112.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Provide a safe operator-triggered smoke command for the Compose runtime bundle.

## In Scope

- Add `npm run runtime:smoke`.
- Wait for PostgreSQL TCP readiness.
- Run Prisma migrate deploy.
- Optionally seed with explicit `RUNTIME_RUN_SEED=true`.
- Run PostgreSQL readiness and search extension readiness checks.
- Run web HTTP smoke.
- Optionally run embedding probe with explicit `RUNTIME_PROBE_EMBEDDING=true`.

## Out Of Scope

- Starting/stopping Compose services from the smoke script.
- Deleting, pruning, resetting, or recreating volumes/cache/uploads/database state.
- Production deployment or backup/restore.
- BM25 extension runtime selection.

## Acceptance Criteria

- `npm run runtime:smoke` validates argument/env handling without destructive actions.
- Runtime smoke works against the local Compose bundle on alternate ports.
- Script defaults are documented and secrets are not printed in full.
- `npm run build` remains passing.
- Destructive command scan finds no cleanup behavior.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps the WT-110 boundary.
