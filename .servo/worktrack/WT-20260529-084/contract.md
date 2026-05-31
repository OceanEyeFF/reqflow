# Worktrack Contract: WT-20260529-084

## Metadata

- worktrack_id: WT-20260529-084
- title: Query understanding 与 Lexical BM25/FTS 检索实现
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: feature
- status: initialized
- priority: 2
- branch: worktrack/wt-20260529-084-lexical-bm25-fts-search
- baseline_branch: develop
- baseline_ref: 586b942c8e2abba2a15c43e12b635e4675ffb44f
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-10 is active and WT-083 completed the schema baseline for profile and snippet metadata.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records MS-10 at 1/6 completed and WT-20260529-084 as active_or_next_worktrack.
- milestone_purpose_alignment: WT-084 implements the lexical retrieval lane and query understanding required before vector generation and hybrid fusion.
- historical_conflict_risk: Medium; existing `src/lib/knowledge/retrieval.ts` is simple includes scoring and must retain existing enabled/selected knowledge-base filtering and citation shape.
- worktrack_adjustment_recommendations: Keep vector search, embedding generation, RRF fusion, context expansion, and evaluation-harness expansion in later WT-085 through WT-088.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add a query understanding helper that produces `rawQuery`, `normalizedQuery`, `lexicalQuery`, `embeddingQuery`, `mustTerms`, and `domainEntities`.
- Replace or augment simple includes scoring with a PostgreSQL-native lexical search fallback suitable for current dev/test readiness.
- Use `KnowledgeSnippetSearchMetadata.lexicalText` when available and safely fall back to snippet content for legacy rows.
- Preserve knowledge base, source, snippet, version, and selected-knowledge-base filters.
- Return explainable lexical debug evidence for tests/internal callers.
- Add focused tests for lexical-only matching, metadata terms, filter preservation, and evidence.

### Out of Scope

- Embedding provider calls and vector generation.
- pgvector search and vector indexes.
- RRF hybrid fusion and reranker seam behavior.
- Context window expansion beyond current citation snippet output.
- AI draft prompt/context integration changes.
- Admin debug UI.

## Affected Modules

- `src/lib/knowledge/retrieval.ts`
- `src/lib/knowledge/retrieval.test.ts`
- `src/lib/knowledge/`
- `.servo/worktrack/WT-20260529-084/`

## Node Policy

- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

1. Query understanding returns separate raw, normalized, lexical, embedding, must-term, and domain-entity fields.
2. Lexical retrieval can match Chinese business snippets through normalized lexical text/metadata, not only raw includes over content.
3. Existing disabled knowledge base, disabled source, disabled snippet, source status, version status, and selected knowledge-base filters remain enforced.
4. Retrieval evidence explains lexical score, matched terms, source of lexical text, and filter inputs without exposing secrets.
5. Returned citations remain grounded in matched snippets; no citation is fabricated.
6. `npm run lint`, `npm run test`, `npm run build`, and PostgreSQL readiness pass.

## Constraints

- Do not claim `pg_search` is available; use the MS-9 native PostgreSQL FTS fallback boundary unless readiness changes.
- Do not raw-score-add lexical and vector signals.
- Do not bypass filters to improve recall.
- Do not send entire knowledge bases or full uploaded files to an AI provider.
- Do not implement vector/fusion/context-builder work in this worktrack.

## Verification Requirements

- Focused retrieval tests.
- `npm run postgres:readiness`
- `npm run lint`
- `npm run test`
- `npm run build`

