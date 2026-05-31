# Worktrack Contract: WT-20260529-087

## Metadata

- worktrack_id: WT-20260529-087
- title: 权限过滤、Context Window Builder 与 citation 聚合
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: feature
- status: initialized
- priority: 5
- branch: worktrack/wt-20260529-087-retrieval-filter-context-expansion
- baseline_branch: develop
- baseline_ref: 660beb9c15ba626ed197884b64b7828008768615
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-10 is active at 4/6 completed; lexical, vector, and hybrid fusion lanes are implemented with evidence.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records WT-20260529-087 as active_or_next_worktrack after WT-086 closeout.
- milestone_purpose_alignment: WT-087 adds context window construction and citation aggregation required before final hybrid regression testing.
- historical_conflict_risk: Medium; context expansion must not bypass knowledge-base/source/snippet/version filters already enforced by lexical/vector retrieval.
- worktrack_adjustment_recommendations: Keep this worktrack focused on context windows, adjacent chunk expansion, dedupe, caps, provenance, and citation grouping. Defer broad evaluation harness expansion to WT-088 and AI draft integration to MS-11.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add a Context Window Builder for hybrid fused retrieval results.
- Expand adjacent chunks from the same source/version/path around selected hits while preserving filters.
- Deduplicate snippets and cap total context size.
- Aggregate citations by source/path/section with provenance for included snippets.
- Return evidence for included, deduped, capped, and skipped snippets.
- Add focused tests for filter preservation, adjacent expansion, dedupe, caps, and citation aggregation.

### Out of Scope

- AI draft prompt/context integration.
- Admin debug UI.
- Evaluation harness expansion; WT-088 owns broad regression gates.
- External search, vector DB, reranking provider, or production reindex workflows.

## Affected Modules

- `src/lib/knowledge/retrieval.ts`
- `src/lib/knowledge/`
- `docs/`
- `.servo/worktrack/WT-20260529-087/`

## Node Policy

- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

1. Context windows include selected hits and eligible adjacent chunks with provenance.
2. Disabled/archived knowledge bases, disabled sources, disabled snippets, non-ready versions, and unselected knowledge bases are never introduced during expansion.
3. Duplicate snippets are deduped.
4. Total context size is capped and skipped/capped evidence is available.
5. Citation aggregation preserves source/path/section/snippet provenance and does not fabricate sources.
6. Focused tests, lint, full tests, build, and PostgreSQL readiness pass.
