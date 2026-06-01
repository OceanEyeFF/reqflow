# Worktrack Contract: WT-20260601-118

## Metadata

- worktrack_id: WT-20260601-118
- title: VectorChord-BM25 / pg_tokenizer runtime PoC
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 04c1fdd2389a931ce208dcc0f416c2959e56a5bf
- branch: worktrack/wt-20260601-118-vectorchord-bm25-poc
- worktree: .worktrees/wt-20260601-118-vectorchord-bm25-poc
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: research + test + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 has WT-115 candidate matrix, WT-116 benchmark harness, and WT-117 ParadeDB evidence completed; default runtime remains unchanged.
- snapshot_freshness: develop baseline is `04c1fdd`, after WT-117 closeout and checkpoint refresh.
- milestone_purpose_alignment: WT-118 tests the VectorChord-BM25 / `pg_tokenizer` candidate against the same compatibility and Chinese benchmark gates.
- historical_conflict_risk: must isolate Docker runtime, avoid persistent volumes, avoid default compose changes, and avoid claiming BM25 default enablement.
- worktrack_adjustment_recommendations: use `tensorchord/vchord-suite:pg18-latest` or record image/runtime failure; keep result comparable with WT-116 gate.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Run a non-destructive VectorChord-BM25 / `pg_tokenizer` runtime PoC that proves
or rejects extension availability, creation, tokenizer setup, BM25 index/query
shape, Chinese benchmark result compatibility, and operational caveats.

## In Scope

- Add a repeatable isolated probe script for VectorChord-BM25.
- Use a temporary candidate container without host data volumes.
- Probe `pg_available_extensions`, `CREATE EXTENSION pg_tokenizer`, `CREATE EXTENSION vchord_bm25`, and `CREATE EXTENSION vector`.
- Attempt minimal tokenizer, BM25 index, and Chinese query probes.
- Generate a result JSON compatible with `scripts/bm25-benchmark-gate.mjs` if candidate queries succeed.
- Document exact runtime facts, failures, and recommendation.

## Out Of Scope

- Modifying `docker-compose.runtime.yml`.
- Replacing the default PostgreSQL image.
- Reusing or migrating existing MS-13 data volumes.
- Changing app retrieval logic or default lexical engine.
- Deleting Docker volumes, uploads, model cache, or existing database state.
- Declaring BM25 active runtime behavior.

## Acceptance Criteria

- Probe script is syntax-valid and documents isolated runtime defaults.
- Evidence records PostgreSQL version, extension availability, extension creation, tokenizer/index/query status, and benchmark gate result or failure reason.
- Documentation records whether VectorChord-BM25 is adopt/defer/reject-for-now for MS-14 purposes.
- Validation includes script syntax, `npm run bm25:evaluate`, result gate if generated, `npm run lint`, `git diff --check`, Docker cleanup check, and policy scans.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: this PoC needs local Docker/process inspection and exact workspace state; it remains a bounded current-carrier task.
