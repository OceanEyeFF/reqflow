# Worktrack Contract: WT-20260601-113

## Metadata

- worktrack_id: WT-20260601-113
- title: Docker runtime final validation and CodeReview
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: review
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 7992bc3fb0a27827d08b26c92d533246cc4e5ef0
- branch: worktrack/wt-20260601-113-runtime-final-validation
- worktree: .worktrees/wt-20260601-113-runtime-final-validation
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: review + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is active with 5/6 worktracks complete; runtime image, compose bundle, smoke orchestration, BM25 feasibility, and operator runbook are merged.
- snapshot_freshness: develop baseline includes WT-112 closeout at `7992bc3`; MS-13 has only WT-113 remaining before fdch0 final acceptance handback.
- milestone_purpose_alignment: WT-113 performs final Docker runtime validation and CodeReview before milestone handback.
- historical_conflict_risk: must not silently skip Docker evidence, delete runtime volumes/cache, claim BM25 active behavior, claim production readiness, or bundle embedding model weights into the web image.
- worktrack_adjustment_recommendations: keep this as final validation/review plus a concise validation report; fix only blockers required for runtime acceptance.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Complete final MS-13 validation and CodeReview for the Docker Compose runtime
bundle, producing evidence suitable for fdch0 milestone acceptance handback.

## In Scope

- Review Dockerfile, `.dockerignore`, compose bundle, runtime smoke script, package scripts, and operator docs.
- Run final validation commands for build, compose config, runtime smoke, readiness, and policy scans.
- Confirm no hidden destructive volume/cache behavior.
- Confirm no false BM25, production readiness, or model-bundling claims.
- Produce final validation evidence and MS-13 handback report.

## Out Of Scope

- Final MS-13 acceptance decision; fdch0 owns milestone acceptance.
- Production deployment, cloud secrets, backup/restore, production migration automation, or remote CI release.
- Default BM25 runtime enablement.
- Default production embedding sidecar enablement.
- Deleting volumes, uploads, local model cache, or database state.

## Acceptance Criteria

- Final validation commands pass or have explicit not-applicable evidence.
- Runtime smoke validates web + PostgreSQL on the local Docker path.
- Review evidence covers performance, architecture, security, quality, and tests, with not-applicable reasons where needed.
- Docs and scripts preserve the MS-13 boundaries: no destructive cleanup, no BM25 enablement claim, no model weights in web image, no production readiness claim.
- A final MS-13 validation report is available for handback.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps final validation and repository state local.
