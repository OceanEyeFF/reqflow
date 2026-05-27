# Worktrack Contract: WT-20260527-042

## Metadata

- worktrack_id: WT-20260527-042
- title: 轻量检索与引用片段选择
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: feature
- status: completed
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 active; WT-039, WT-045, WT-040, WT-041 completed; baseline branch `develop`.
- snapshot_freshness: repo baseline `10ff7dffbf30e50638ad340b21bb598640bbc08a` includes parsed knowledge snippets.
- milestone_purpose_alignment: Implements MS7 completion signal 7 by selecting enabled knowledge snippets and displaying citations in AI drafts.
- historical_conflict_risk: Must not introduce embeddings, pgvector, semantic/vector search, or raw uploaded file provider context.
- worktrack_adjustment_recommendations: Use deterministic lightweight keyword scoring over enabled snippets.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: 10ff7dffbf30e50638ad340b21bb598640bbc08a
- work_branch: worktrack/wt-20260527-042-kb-lightweight-retrieval
- worktree_path: .worktrees/wt-20260527-042-kb-lightweight-retrieval
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Use enabled parsed knowledge snippets as bounded, traceable AI draft context through deterministic lightweight retrieval.

### In Scope

- Query enabled `KnowledgeSnippet` records with simple keyword scoring.
- Convert selected snippets to provider-neutral `KnowledgeCitation` records.
- Merge persisted knowledge citations with existing static MS6 fallback snippets.
- Preserve empty-context fallback.
- Tests for enabled-only selection, citation shape, no fabricated citations, and draft service integration.

### Out of Scope

- Embeddings, vector database, semantic search, pgvector.
- Admin UI management for knowledge records.
- Upload/parse changes beyond consuming existing snippets.

## Acceptance Criteria

1. AI draft knowledge assembly can include enabled persisted snippets with source/version/path metadata.
2. Disabled snippets/sources are excluded.
3. Selection is bounded and deterministic.
4. Empty-context fallback remains valid.
5. `npm run lint`, `npm run test`, and `npm run build` pass.
