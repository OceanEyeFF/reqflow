# Worktrack Contract: WT-20260601-123

## Metadata

- worktrack_id: WT-20260601-123
- title: ParadeDB image pinning and alternate compose/profile design
- milestone_id: MS-15
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 6821c1405d98a2a02eb5bc04312971ebd2805a63
- branch: worktrack/wt-20260601-123-paradedb-runtime-design
- worktree: .worktrees/wt-20260601-123-paradedb-runtime-design
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: documentation + config-validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-15 is active and limits this milestone to ParadeDB `pg_search` runtime replacement validation.
- snapshot_freshness: develop baseline is `6821c14`, after MS-15 activation.
- milestone_purpose_alignment: WT-123 designs the repeatable, isolated candidate runtime entrypoint needed before Prisma/app/runtime smoke testing.
- historical_conflict_risk: `docker-compose.runtime.yml` is the accepted MS-13 default runtime path and must not be mutated in WT-123.
- worktrack_adjustment_recommendations: add a separate candidate compose file and design doc; avoid starting containers or migrating data in this worktrack.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Create a repeatable ParadeDB runtime candidate entrypoint that can be validated
by later MS-15 worktracks without touching the accepted MS-13 default runtime or
local persistent data.

## In Scope

- Record current `paradedb/paradedb:latest` manifest/index digest evidence.
- Add a standalone candidate compose file with separate volume names and alternate default ports.
- Document operator commands, pinning caveats, rollback/data boundaries, and WT-124 handoff.
- Validate compose config shape and non-claim policy boundaries.

## Out Of Scope

- Starting the candidate runtime containers.
- Running Prisma migrations, seed, or web smoke against ParadeDB.
- Re-running Chinese BM25 benchmark.
- Changing `docker-compose.runtime.yml`.
- Deleting or migrating Docker volumes, uploads, model cache, or database state.
- Enabling BM25 in the default runtime.

## Acceptance Criteria

- Candidate compose config validates with `docker compose -f docker-compose.paradedb.yml config`.
- Candidate compose uses separate volumes from the MS-13 default runtime.
- Design doc records image digest evidence and explains why `latest` is insufficient as final runtime evidence.
- Design doc gives WT-124 handoff commands and safety boundaries.
- Policy scan does not find false claims that BM25 or ParadeDB is active in the default runtime.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier with explorer sidecar
- decision_inputs: explorer delegated for read-only runtime/compose inventory; current carrier owns file edits and validation.
- fallback_reason: edits are tightly scoped and require direct integration with Harness artifacts.
