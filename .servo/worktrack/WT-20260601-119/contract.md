# Worktrack Contract: WT-20260601-119

## Metadata

- worktrack_id: WT-20260601-119
- title: pg_textsearch runtime compatibility PoC
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 2435c855e9075e45e90078c69b844188205b3929
- branch: worktrack/wt-20260601-119-pg-textsearch-poc
- worktree: .worktrees/wt-20260601-119-pg-textsearch-poc
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: research + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 has candidate matrix, benchmark harness, ParadeDB pass-with-caveats evidence, and VectorChord defer evidence; default runtime remains unchanged.
- snapshot_freshness: develop baseline is `2435c85`, after WT-118 closeout and checkpoint refresh.
- milestone_purpose_alignment: WT-119 evaluates the remaining `pg_textsearch` BM25 candidate against ReqFlow runtime constraints and packaging feasibility.
- historical_conflict_risk: `pg_textsearch` likely requires PostgreSQL 17/18, extension installation, and `shared_preload_libraries`; do not mutate default runtime or compile/install into existing containers.
- worktrack_adjustment_recommendations: keep this as compatibility/package-path PoC unless an official ready-to-run image is available; record defer evidence if extension is unavailable in candidate images.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Evaluate whether Timescale/TigerData `pg_textsearch` is viable for ReqFlow's
MS-14 candidate-runtime evaluation without building a custom PostgreSQL image
or changing the MS-13 default runtime.

## In Scope

- Probe official/current documentation and local candidate images for extension availability.
- Record PostgreSQL version, `pg_available_extensions` status, preload requirements, and packaging gaps.
- Use temporary isolated containers only.
- Produce a compatibility report and clear adopt/defer/reject-for-now decision.

## Out Of Scope

- Building a custom PostgreSQL image from source.
- Installing OS packages into existing runtime containers.
- Modifying `docker-compose.runtime.yml`.
- Changing application retrieval logic.
- Migrating or deleting volumes/cache/uploads/database state.
- Declaring BM25 active runtime behavior.

## Acceptance Criteria

- Evidence records whether `pg_textsearch` is available in tested candidate images.
- Evidence records why full query/index benchmark was or was not executed.
- Documentation states whether `pg_textsearch` should proceed, defer, or reject for now.
- Validation includes script syntax if a probe script is added, `git diff --check`, policy scan, and Docker cleanup check.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: this compatibility work requires local Docker/process inspection and concise research synthesis.
