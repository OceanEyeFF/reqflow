# Worktrack Contract: WT-20260601-108

## Metadata

- worktrack_id: WT-20260601-108
- title: Web app Dockerfile 与 runtime env contract
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: d83acb32797dd64c733b4af995bed8937bb2c6f7
- branch: worktrack/wt-20260601-108-web-dockerfile
- worktree: .worktrees/wt-20260601-108-web-dockerfile
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is the next planned milestone after accepted MS-12; scope is Docker Compose Runtime Bundle 与本地一键运行.
- snapshot_freshness: control-state and milestone-backlog have stale MS-12 active/accepted disagreement; MS-13 artifact and worktrack backlog define WT-108 as first planned MS-13 worktrack.
- milestone_purpose_alignment: WT-108 directly supports MS-13 by establishing the web runtime image and environment contract before compose orchestration.
- historical_conflict_risk: do not bundle embedding model weights, do not run migrations/seed on web startup, do not claim BM25 runtime support, and do not delete volumes/cache.
- worktrack_adjustment_recommendations: keep WT-108 as a narrow first slice.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Create a production-buildable web application Docker image boundary and document
the runtime environment contract needed by later MS-13 compose orchestration.

## In Scope

- Enable Next.js standalone build output.
- Add a web `Dockerfile` that builds the app and runs the standalone server as a non-root user.
- Add `.dockerignore` to exclude local secrets, worktrees, tool output, local DBs, logs, and caches from image build context.
- Document required and optional web runtime environment variables.

## Out Of Scope

- Docker Compose bundle changes.
- Migration, seed, readiness, or probe orchestration scripts.
- Embedding sidecar integration.
- BM25 extension runtime selection.
- Production deployment, backup/restore, or secret manager setup.
- Deleting volumes, caches, uploads, or local databases.

## Acceptance Criteria

- `npm run build` passes with standalone output enabled.
- Dockerfile uses the existing npm lockfile and Prisma generate before build.
- Runtime image does not copy `.env*`, `.servo`, worktrees, local database files, logs, or embedding model cache.
- Runtime docs identify `DATABASE_URL` and `AUTH_SECRET` as required runtime secrets and keep them out of build args.
- Docs state that migrations/seed and compose orchestration belong to later worktracks.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps the WT-108 boundary.
