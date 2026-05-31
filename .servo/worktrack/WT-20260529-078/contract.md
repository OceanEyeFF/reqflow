# Worktrack Contract: WT-20260529-078

## Metadata

- worktrack_id: WT-20260529-078
- title: Hybrid Search 架构决策与风险边界
- milestone_id: MS-9
- derived_from_milestone: true
- node_type: architecture
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-9`; baseline branch `develop`; MS-9 purpose is to establish PostgreSQL + pgvector + BM25/FTS hybrid search architecture, migration boundaries, extension readiness, and Chinese retrieval quality gates before implementation.
- snapshot_freshness: current `Repo Snapshot/Status`, `Harness Control State`, `milestone-backlog`, and `worktrack-backlog` identify `WT-20260529-078` as the first planned MS-9 worktrack. Current HEAD is newer than the stored observed checkpoint because MS-9 was just activated; this worktrack must refresh control evidence during closeout.
- milestone_purpose_alignment: directly supports MS-9 completion signals 1, 5, and 7 by defining the ADR, SearchIndexProfile invariants, provider abstractions, RRF fusion, reranker seam, debug evidence contract, and filtered pgvector risk boundary.
- historical_conflict_risk: medium; must supersede the old lightweight SQLite/includes Chinese retrieval direction without changing runtime behavior, Prisma schema, CI, or production provider choices in this worktrack.
- worktrack_adjustment_recommendations: keep as an architecture/docs worktrack; no implementation, no migration, no package install, no extension enablement.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 081cb0cf5b36c633b03047c88e8ba026db75a826
- work_branch: worktrack/wt-20260529-078-hybrid-search-architecture
- worktree_path: .worktrees/wt-20260529-078-hybrid-search-architecture

## Scope

### Goal

Create the MS-9 hybrid search architecture decision record and risk boundary that future PostgreSQL, pgvector, lexical search, evaluation, and AI-context worktracks must follow.

### In Scope

- Add a repo-local architecture ADR under `docs/`.
- Define PostgreSQL, pgvector, `pg_search`/BM25, PostgreSQL native FTS fallback, query understanding, RRF fusion, context builder, reranker seam, SearchIndexProfile invariants, and debug evidence contracts.
- Record current repo facts from the existing SQLite Prisma schema, knowledge retrieval, AI draft context assembly, and CI database setup.
- Record deployment/readiness questions that must be answered by later MS-9 worktracks.
- Update WT-078 control artifacts and gate evidence.

### Out of Scope

- Changing application source code.
- Changing `prisma/schema.prisma`, migrations, seed, or generated Prisma client output.
- Installing packages or PostgreSQL extensions.
- Enabling production PostgreSQL, `pgvector`, `pg_search`, background embedding jobs, external hosted search, third-party vector databases, or paid provider changes.
- Changing AI draft behavior, prompt behavior, provider configuration, UI behavior, or ticket creation flow.
- Running production data migrations.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: decision record + feasibility evidence + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- ADR states the selected hybrid search architecture and explicitly preserves the AI manual-confirmation boundary.
- ADR distinguishes `pg_search` BM25 as preferred if deployable and PostgreSQL native FTS plus Chinese tokenization/normalization as required fallback.
- ADR defines SearchIndexProfile immutability and separates EmbeddingProviderConfig from AiProviderConfig.
- ADR defines query understanding, lexical search, vector search, RRF fusion, context builder, optional reranker seam, and debug evidence contract boundaries.
- ADR records filtered pgvector recall/performance risks and later mitigation options.
- ADR maps decisions to current repo-local source/model/CI facts and MS-9 follow-up worktracks.
- No source, Prisma schema, migration, package, or CI behavior changes are made.

## Verification Requirements

- `git diff --check`
- Targeted consistency search for `hybrid search`, `SearchIndexProfile`, `RRF`, `pgvector`, and out-of-scope implementation changes.
- Review that only docs and `.servo` artifacts changed.
- Build gate is not required for docs-only architecture work, but may be run if time permits.

## Rollback Conditions

- ADR implies that sending an entire knowledge base to the AI provider is an acceptable retrieval substitute.
- ADR allows mixing vectors across embedding models/dimensions/profiles.
- ADR presents `pg_search`, `pgvector`, PostgreSQL production migration, or external hosted search as already enabled.
- ADR changes source, schema, migrations, packages, CI, or runtime behavior.
