# Worktrack Contract: WT-20260529-081

## Metadata

- worktrack_id: WT-20260529-081
- title: pgvector 与 BM25/FTS extension readiness
- milestone_id: MS-9
- derived_from_milestone: true
- node_type: architecture
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-9`; WT-078 defined the hybrid search ADR, WT-079 established PostgreSQL dev/test/CI service readiness, and WT-080 migrated Prisma/test/CI to PostgreSQL.
- snapshot_freshness: `develop` baseline is `fc5ab150e86c8e51658fc2b29dd50d596f74cd92`, with MS-9 progress at 3/5.
- milestone_purpose_alignment: directly supports MS-9 completion signal 4 and acceptance criterion 3 by making pgvector readiness and BM25/FTS fallback deployability evidence explicit.
- historical_conflict_risk: medium; extension availability varies by image/provider, and `pg_search` may require binaries plus `shared_preload_libraries`. The worktrack must not assume BM25 availability without evidence.
- worktrack_adjustment_recommendations: verify pgvector using a reproducible PostgreSQL image, verify native PostgreSQL FTS as fallback, detect but do not require `pg_search` unless explicitly configured, and document deployment boundaries.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: fc5ab150e86c8e51658fc2b29dd50d596f74cd92
- work_branch: worktrack/wt-20260529-081-search-extension-readiness
- worktree_path: .worktrees/wt-20260529-081-search-extension-readiness

## Scope

### Goal

Provide executable readiness evidence for pgvector and PostgreSQL native FTS, plus a deployability decision for `pg_search` BM25.

### In Scope

- PostgreSQL service image/update needed to make pgvector available in dev/test/CI.
- A readiness script that validates PostgreSQL version, pgvector availability, vector type/query/index basics, native FTS basics, and `pg_search` availability.
- CI wiring for extension readiness.
- Documentation of `pg_search` deployability, native FTS + Chinese normalization fallback, filtered pgvector recall/performance risks, and WT-082 handoff.
- WT-081 control artifacts and gate evidence.

### Out of Scope

- Adding application search/index tables.
- Adding SearchIndexProfile or embedding provider schema.
- Implementing retrieval, query understanding, RRF, context building, reranking, or debug evidence.
- Installing ParadeDB/`pg_search` binaries into this repo's PostgreSQL image.
- Production extension rollout or managed database provider selection.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: decision record + feasibility evidence + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Dev/test/CI PostgreSQL image can expose pgvector.
- Readiness script proves `CREATE EXTENSION vector`, vector distance query behavior, and vector index DDL in an isolated schema.
- Readiness script proves PostgreSQL native FTS with `to_tsvector` and `websearch_to_tsquery` over pre-tokenized Chinese fallback text.
- Readiness script detects `pg_search`; if unavailable, it records a fallback decision rather than claiming BM25 readiness.
- Documentation explains `pg_search` deployment requirements and why native FTS + Chinese normalization is the fallback for the current baseline.
- No hybrid retrieval runtime implementation is introduced.

## Verification Requirements

- `node --check scripts/search-extension-readiness.mjs`
- `git diff --check`
- `npm run postgres:wait`
- `npm run search:extensions`
- `npm run lint`
- `npm run test`
- `npm run build`
- Review changed files for retrieval/runtime scope non-change.

## Rollback Conditions

- pgvector cannot be made reproducibly available in dev/test/CI.
- Native PostgreSQL FTS fallback cannot be executed.
- `pg_search` is documented as available without binary/config evidence.
- Extension readiness changes alter application runtime retrieval behavior.
