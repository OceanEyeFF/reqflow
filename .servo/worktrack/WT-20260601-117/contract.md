# Worktrack Contract: WT-20260601-117

## Metadata

- worktrack_id: WT-20260601-117
- title: ParadeDB pg_search runtime PoC
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 975a9199d2c10e57ecf981e637f9f542e28485af
- branch: worktrack/wt-20260601-117-pg-search-runtime-poc
- worktree: .worktrees/wt-20260601-117-pg-search-runtime-poc
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: research + test + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 is active with WT-115 and WT-116 completed; benchmark corpus and result gate are available.
- snapshot_freshness: develop baseline is `975a919`, after WT-116 benchmark harness closeout and checkpoint refresh.
- milestone_purpose_alignment: WT-117 tests the primary ParadeDB `pg_search` candidate against compatibility and Chinese benchmark gates before any default runtime decision.
- historical_conflict_risk: must avoid mutating `docker-compose.runtime.yml`, persistent volumes, uploads, model cache, and the existing PostgreSQL runtime.
- worktrack_adjustment_recommendations: use an isolated temporary Docker container on an alternate port, no host volume, no default compose path, and record failure evidence if image pull/runtime/probe fails.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Run a non-destructive ParadeDB `pg_search` runtime PoC that proves or rejects
basic candidate compatibility: Docker runtime availability, PostgreSQL version,
extension availability, `CREATE EXTENSION`, coexistence with `vector`, minimal
BM25 index/query probes, Chinese tokenizer behavior evidence, and benchmark
result gate compatibility.

## In Scope

- Add a repeatable isolated probe script for ParadeDB `pg_search`.
- Use a temporary candidate container without host data volumes.
- Probe `pg_available_extensions`, `CREATE EXTENSION pg_search`, and `CREATE EXTENSION vector`.
- Create a small BM25 index and representative Chinese query result set if the candidate syntax works locally.
- Generate a result JSON compatible with `scripts/bm25-benchmark-gate.mjs`.
- Document exact runtime facts, command, result, and fallback boundary.

## Out Of Scope

- Modifying `docker-compose.runtime.yml`.
- Replacing the default PostgreSQL image.
- Reusing or migrating existing MS-13 data volumes.
- Running Prisma migrations against candidate data.
- Changing application retrieval code or default lexical engine.
- Deleting Docker volumes, uploads, model cache, or existing database state.
- Declaring BM25 active runtime behavior.

## Acceptance Criteria

- Probe script is syntax-valid and documents isolated runtime defaults.
- If Docker/image/runtime succeeds, evidence records PostgreSQL version, extension availability, extension creation, vector coexistence, index/query probe, tokenizer notes, and result gate output.
- If Docker/image/runtime fails, evidence records the failure as candidate compatibility/runtime evidence without mutating default runtime.
- `npm run bm25:evaluate` and the WT-117 result file gate pass when a result file is generated.
- Documentation records whether ParadeDB `pg_search` is adopt/defer/reject-for-now for MS-14 purposes.
- Validation includes `git diff --check`, script syntax, benchmark corpus gate, and policy scans.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: this PoC needs local Docker/process inspection and exact workspace state; it remains a bounded current-carrier task.
