# Worktrack Contract: WT-20260529-086

## Metadata

- worktrack_id: WT-20260529-086
- title: RRF Hybrid fusion、reranker seam 与 score evidence
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: feature
- status: initialized
- priority: 4
- branch: worktrack/wt-20260529-086-hybrid-fusion-score-evidence
- baseline_branch: develop
- baseline_ref: 57fc728ceea51b7a6c50e6c88fa15d48df48fd64
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-10 is active at 3/6 completed; WT-083 established index schema, WT-084 lexical retrieval, and WT-085 pgvector embedding/vector candidate retrieval.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records WT-20260529-086 as the active_or_next_worktrack after WT-085 closeout.
- milestone_purpose_alignment: WT-086 combines lexical and vector candidate lanes through explainable RRF-style fusion before later context building and regression harness work.
- historical_conflict_risk: Medium; existing `selectKnowledgeSnippets()` must remain stable for AI draft callers, and fusion must not raw-score-add lexical and vector scores.
- worktrack_adjustment_recommendations: Keep this worktrack focused on hybrid retrieval orchestration, rank fusion, optional reranker seam with no external provider requirement, and score/debug evidence. Defer context window expansion and citation aggregation to WT-087 and broad evaluation harness expansion to WT-088.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add RRF-style rank fusion over lexical and vector candidate lists.
- Add hybrid retrieval API/evidence that preserves lexical hits, vector hits, fused ranks, component ranks, and score breakdown.
- Add an optional reranker seam that is disabled/no-op by default and does not require third-party reranking.
- Preserve existing lexical-only `selectKnowledgeSnippets()` citation behavior for current AI draft callers unless explicitly routed through hybrid retrieval.
- Ensure vector failures degrade to lexical-only evidence rather than breaking lexical retrieval.
- Add focused tests for lexical-only, vector-only, overlap, vector failure, and no raw score addition.

### Out of Scope

- Context Window Builder, adjacent chunk expansion, and citation aggregation.
- AI draft prompt/context integration changes.
- Admin debug UI.
- External reranking providers or provider billing changes.
- Broad evaluation harness expansion; WT-088 owns end-to-end regression gates.

## Affected Modules

- `src/lib/knowledge/retrieval.ts`
- `src/lib/knowledge/embeddings.ts`
- `src/lib/knowledge/`
- `docs/`
- `.servo/worktrack/WT-20260529-086/`

## Node Policy

- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

1. Hybrid retrieval uses reciprocal rank fusion or equivalent rank-based fusion; lexical and vector raw scores are not added directly.
2. Debug evidence explains lexical rank, vector rank, fused rank, RRF contribution, and final score components.
3. Lexical-only behavior remains available and existing public citation callers keep working.
4. Vector lane failure produces explainable degraded evidence and does not break lexical retrieval.
5. Reranker seam exists as optional/no-op infrastructure without external provider dependency.
6. Focused hybrid tests, lint, full tests, build, and PostgreSQL readiness pass.

## Constraints

- Do not bypass enabled/ready/selected knowledge-base filters.
- Do not claim BM25 if the active path is native PostgreSQL FTS fallback.
- Do not call external reranking or embedding providers in tests.
- Do not implement context expansion or AI draft integration in WT-086.
- Do not activate or accept MS-10; fdch0 retains milestone final acceptance.

## Verification Requirements

- Focused hybrid retrieval tests.
- `npm run postgres:readiness`
- `npm run search:extensions`
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Fusion ranking silently ignores profile/filter boundaries.
- Existing lexical retrieval or citation API regresses.
- Hybrid evidence cannot distinguish lexical/vector/fused contribution.
- Vector failures crash lexical retrieval.
