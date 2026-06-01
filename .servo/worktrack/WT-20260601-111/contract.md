# Worktrack Contract: WT-20260601-111

## Metadata

- worktrack_id: WT-20260601-111
- title: Postgres BM25 extension runtime feasibility and fallback packaging
- milestone_id: MS-13
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 79cb8ca71555a0ecb97cab2aba6dca6b2163dbe5
- branch: worktrack/wt-20260601-111-bm25-runtime-image
- worktree: .worktrees/wt-20260601-111-bm25-runtime-image
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-13 is active; WT-108 through WT-110 completed the web image, compose bundle, and runtime smoke.
- snapshot_freshness: develop baseline includes WT-110 closeout at `79cb8ca`; MS-13 progress is 3/6.
- milestone_purpose_alignment: WT-111 evaluates BM25 extension runtime candidates and packages fallback readiness without changing default behavior.
- historical_conflict_risk: must not claim BM25 behavior, replace the DB image, or change runtime defaults without a separate enablement milestone.
- worktrack_adjustment_recommendations: keep this as research/readiness detection, not implementation of a BM25 lexical engine.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Evaluate PostgreSQL BM25 runtime candidates and strengthen readiness reporting
while preserving the current native FTS fallback runtime.

## In Scope

- Compare ParadeDB `pg_search`, Timescale/TigerData `pg_textsearch`, and VectorChord-BM25.
- Update readiness detection to report BM25 candidate availability.
- Document the packaging recommendation and anti-claim boundary.

## Out Of Scope

- Switching `docker-compose.runtime.yml` to a BM25 image.
- Implementing BM25 query/index paths in application retrieval.
- Data migration, volume replacement, production deployment, or extension preload changes.

## Acceptance Criteria

- Candidate research cites current primary sources.
- `npm run search:extensions` still passes on the current runtime and reports fallback behavior.
- `SEARCH_REQUIRE_BM25_EXTENSION=true npm run search:extensions` fails on the current runtime, proving strict mode.
- Docs explicitly say default MS-13 runtime does not enable BM25.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: no explicit user request to spawn subagents; current carrier keeps the WT-111 boundary.
