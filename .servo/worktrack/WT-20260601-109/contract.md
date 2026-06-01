# Worktrack Contract: WT-20260601-109

## Metadata

- worktrack_id: WT-20260601-109
- title: Compose bundle: web + postgres/pgvector + embedding sidecar
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: cdb39cfd785da72c56f5ba1baa35a15eb5194c13
- branch: worktrack/wt-20260601-109-compose-runtime-bundle
- worktree: .worktrees/wt-20260601-109-compose-runtime-bundle
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is active; WT-20260601-108 completed the web image and runtime env contract.
- snapshot_freshness: develop baseline includes WT-108 closeout at `cdb39cf`; MS-13 progress is 1/6.
- milestone_purpose_alignment: WT-109 composes the web image, PostgreSQL/pgvector, and optional embedding sidecar into one runtime bundle, directly serving MS-13 completion signals.
- historical_conflict_risk: do not run migrations/seed automatically, do not start embedding sidecar by default, do not delete volumes/cache, and do not claim BM25 runtime support.
- worktrack_adjustment_recommendations: keep WT-109 focused on Compose wiring and operator docs; leave orchestration scripts to WT-110.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Add a local Docker Compose runtime bundle that can start the web app and
PostgreSQL together, with an optional embedding sidecar profile.

## In Scope

- Add `docker-compose.runtime.yml` with `web`, `postgres`, and profile-gated `embedding` services.
- Wire the web service to the Compose PostgreSQL service using runtime env vars.
- Keep uploads, database data, and embedding model cache in named volumes.
- Document start commands, optional sidecar behavior, and cleanup boundaries.

## Out Of Scope

- Migration/seed/readiness/probe orchestration scripts.
- Production deployment or cloud runtime hardening.
- BM25 extension runtime selection.
- Deleting or resetting volumes, uploads, model cache, or database state.
- Making embedding sidecar default or copying model weights into the web image.

## Acceptance Criteria

- `docker compose -f docker-compose.runtime.yml config` succeeds with a local `AUTH_SECRET`.
- `docker compose -f docker-compose.runtime.yml build web` succeeds.
- Compose config shows `embedding` is profile-gated and not required for default web/PostgreSQL startup.
- Documentation states migrations and seed remain separate operator steps.
- No command in the bundle silently deletes data volumes or model cache.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps the WT-109 boundary.
