# Worktrack Contract: WT-20260601-112

## Metadata

- worktrack_id: WT-20260601-112
- title: Operator runbook 与本地 smoke 验收
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: docs
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: ccf283fed9811f33d60c4fe425c37fbae505c267
- branch: worktrack/wt-20260601-112-runtime-runbook
- worktree: .worktrees/wt-20260601-112-runtime-runbook
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: docs + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is active; WT-108 through WT-111 completed the web Docker image, compose runtime bundle, runtime smoke script, and BM25 runtime feasibility boundary.
- snapshot_freshness: develop baseline includes WT-111 closeout at `ccf283f`; MS-13 progress is 4/6.
- milestone_purpose_alignment: WT-112 documents the operator path for starting, validating, inspecting, stopping, and troubleshooting the runtime bundle.
- historical_conflict_risk: docs must not claim production readiness, BM25 enablement, model weights in the web image, automatic migrations on web startup, or safe volume/cache deletion.
- worktrack_adjustment_recommendations: keep this as operator documentation plus local smoke evidence; do not add new lifecycle automation.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Provide a clear MS-13 operator runbook for local Docker Compose runtime startup,
setup, smoke validation, optional embedding probing, logs, stop behavior,
volume/cache boundaries, and troubleshooting.

## In Scope

- Add an operator runbook for the `docker-compose.runtime.yml` path.
- Refresh README and project handoff entrypoints to point at the MS-13 runtime path.
- Document safe start, migrate, seed, smoke, log, stop, optional embedding, and troubleshooting commands.
- Apply a minimal Docker build command repair if local runtime smoke exposes a container-only Next.js build blocker.
- Record validation evidence for documentation freshness and local runtime smoke readiness.

## Out Of Scope

- Changing compose service behavior or runtime scripts.
- Broad Dockerfile refactors beyond a minimal build-command repair needed for runtime smoke.
- Starting/stopping containers from the application automatically.
- Deleting volumes, upload storage, model cache, or database state.
- Enabling BM25 in the default runtime bundle.
- Making the embedding sidecar default or production-ready.
- Changing secret management or cloud deployment policy.

## Acceptance Criteria

- README exposes a concise Docker runtime bundle path in addition to the development path.
- Operator docs cover start, config validation, migrate, seed, smoke, logs, stop, optional embedding probe, cache/volume policy, and troubleshooting.
- Docs explicitly distinguish native PostgreSQL FTS fallback from BM25 and keep embedding sidecar optional.
- Validation includes build/config/doc checks and a runtime smoke command or explicit blocker.
- No documented default command silently deletes volumes, model cache, uploads, or database state.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps the WT-112 documentation and validation boundary.
