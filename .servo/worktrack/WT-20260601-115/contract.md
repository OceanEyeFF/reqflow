# Worktrack Contract: WT-20260601-115

## Metadata

- worktrack_id: WT-20260601-115
- title: BM25 插件候选矩阵与评测方案
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: research
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: dcb816462ab06cfd9ef0191d23e502311c996c8c
- branch: worktrack/wt-20260601-115-bm25-candidate-matrix
- worktree: .worktrees/wt-20260601-115-bm25-candidate-matrix
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: research + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 is active after fdch0 accepted MS-13; default runtime remains native PostgreSQL FTS fallback plus pgvector.
- snapshot_freshness: develop baseline includes MS-14 activation at `dcb8164`; MS-14 progress is 0/8.
- milestone_purpose_alignment: WT-115 establishes the candidate matrix and evaluation plan before any candidate runtime PoC.
- historical_conflict_risk: must not claim BM25 is active, must not start destructive runtime experiments, and must distinguish BM25 plugins from Chinese tokenizer-only extensions.
- worktrack_adjustment_recommendations: keep this as research/design; defer Docker pulls, extension creation, and benchmark execution to later worktracks.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Create the MS-14 BM25 candidate matrix and evaluation plan for PostgreSQL
plugin compatibility, Chinese behavior, performance, and accuracy testing.

## In Scope

- Verify current upstream facts for BM25 candidate plugin families.
- Identify tokenizer/Chinese FTS helper candidates separately from BM25 plugins.
- Define compatibility gates, benchmark dimensions, Chinese corpus requirements, and decision criteria.
- Produce a doc that later WT-116 through WT-122 can execute against.

## Out Of Scope

- Pulling candidate images or starting candidate containers.
- Creating extensions in a live database.
- Modifying default `docker-compose.runtime.yml`.
- Changing application retrieval logic.
- Deleting volumes/cache or migrating data.
- Claiming BM25 as active runtime behavior.

## Acceptance Criteria

- Candidate matrix covers ParadeDB `pg_search`, Timescale/TigerData `pg_textsearch`, VectorChord-BM25 / `pg_tokenizer`, and Chinese tokenizer helpers such as `zhparser` / `pg_jieba`.
- Plan distinguishes BM25 ranking plugins from tokenizer-only or native FTS helpers.
- Plan defines compatibility, Chinese tokenization, performance, accuracy, and policy gates.
- Sources are current and primary/upstream where possible.
- Validation includes documentation/policy scans and `git diff --check`.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: research-only worktrack; current carrier keeps source review and docs changes local.
