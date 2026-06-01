# Worktrack Contract: WT-20260601-124

## Metadata

- worktrack_id: WT-20260601-124
- title: Prisma migration, seed, readiness, and web smoke on ParadeDB runtime
- milestone_id: MS-15
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 7e9f791e7286cc678cf93f270b164817d257d34f
- branch: worktrack/wt-20260601-124-paradedb-prisma-smoke
- worktree: .worktrees/wt-20260601-124-paradedb-prisma-smoke
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: runtime-smoke + readiness + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-15 is active and limits this milestone to ParadeDB `pg_search` runtime replacement validation.
- snapshot_freshness: develop baseline is `7e9f791`, after WT-20260601-123 repo refresh.
- milestone_purpose_alignment: WT-124 validates whether the candidate ParadeDB runtime can host the existing Prisma schema, seed/readiness path, extension checks, and web startup smoke.
- historical_conflict_risk: current MS-13 runtime remains the accepted default; WT-124 must use `docker-compose.paradedb.yml` and separate candidate volumes only.
- worktrack_adjustment_recommendations: record pass/fail evidence without deleting volumes; fix only non-destructive orchestration blockers in this worktrack.
- add_remove_worktrack_recommendations: none at intake.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Validate the ParadeDB candidate runtime path far enough to prove whether the
existing app can migrate, seed, check PostgreSQL/search readiness, and serve a
basic web smoke without changing the accepted default runtime.

## In Scope

- Validate `docker-compose.paradedb.yml` config.
- Start the candidate `postgres` and `web` services on alternate ports.
- Run `npm run runtime:smoke` against the candidate runtime with seed enabled.
- Run strict `pg_search` and `vector` readiness against the candidate database.
- Capture PostgreSQL, `pg_search`, and `vector` version evidence when available.
- Stop the candidate services without deleting volumes.
- Record blocker evidence and a gate verdict.

## Out Of Scope

- Changing `docker-compose.runtime.yml`.
- Switching the default runtime to ParadeDB.
- Deleting Docker volumes, uploads, model cache, or database state.
- Production data migration.
- Chinese BM25 benchmark rerun or tokenizer selection.
- Retrieval algorithm or fusion changes.

## Acceptance Criteria

- Candidate compose config validates.
- Candidate runtime starts without mutating MS-13 default runtime files or volumes.
- Prisma validate/migrate path, seed/readiness, extension readiness, and web HTTP smoke pass, or blockers are documented with command output summaries.
- Strict `SEARCH_REQUIRE_PG_SEARCH=true` readiness distinguishes `pg_search` and `vector` installed/available states.
- Candidate services are stopped non-destructively after validation.
- Gate evidence records version facts, pass/fail commands, and policy scan results.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier with explorer sidecar
- decision_inputs: current carrier owns Docker/runtime commands and artifact edits; explorer sidecar performs read-only script/env risk review.
- fallback_reason: runtime smoke is on the critical path and needs direct command/result integration with gate evidence.
