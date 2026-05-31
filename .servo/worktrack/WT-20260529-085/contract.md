# Worktrack Contract: WT-20260529-085

## Metadata

- worktrack_id: WT-20260529-085
- title: Embedding 生成与 pgvector 索引
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: feature
- status: initialized
- priority: 3
- branch: worktrack/wt-20260529-085-embedding-pgvector-index
- baseline_branch: develop
- baseline_ref: 02e14324723e15e51d9aa1f31713982a61ce758e
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-10 is active; WT-083 established SearchIndexProfile, EmbeddingProviderConfig, KnowledgeEmbedding, and searchable metadata; WT-084 established query understanding and lexical fallback retrieval evidence.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records MS-10 at 2/6 completed and WT-20260529-085 as active_or_next_worktrack.
- milestone_purpose_alignment: WT-085 implements the vector lane required by MS-10 before RRF fusion, context expansion, and hybrid regression testing.
- historical_conflict_risk: Medium; pgvector readiness exists from MS-9, but Prisma 5 does not expose a native vector field, and vectors must not be mixed across profile/model/dimension boundaries.
- worktrack_adjustment_recommendations: Keep this worktrack focused on deterministic embedding generation, profile-bound vector persistence, pgvector schema/index readiness, and fail-closed vector candidate retrieval. Defer fusion, reranking, context window building, AI draft integration, and broad regression gates to WT-086 through WT-088.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add pgvector-compatible persistence for snippet embeddings without removing WT-083 schema fields.
- Implement a server-side embedding provider abstraction separate from AI chat providers.
- Add a deterministic fake embedding provider for repeatable local tests.
- Generate or upsert snippet embeddings bound to the active SearchIndexProfile.
- Enforce fail-closed behavior for missing inactive profiles, missing provider config, dimensions mismatch, profile mismatch, and vector mixing risk.
- Add vector candidate retrieval evidence scoped to the active profile.
- Add focused tests and docs for embedding/provider/profile invariants and pgvector index expectations.
- Update WT-085/MS-10 artifacts with validation evidence.

### Out of Scope

- RRF hybrid fusion, score fusion, or reranker behavior.
- Context Window Builder, adjacent chunk expansion, and citation aggregation.
- AI draft prompt/context integration changes.
- Admin UI or operator-triggered production reindex workflows.
- External vector databases, hosted search, external reranking providers, background queues, or provider billing changes.
- Bulk production embedding generation.

## Affected Modules

- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/lib/knowledge/`
- `docs/`
- `.servo/worktrack/WT-20260529-085/`

## Node Policy

- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

1. KnowledgeEmbedding can persist pgvector-compatible embedding data while remaining profile/model/dimension/content-hash bound.
2. Embedding provider selection is independent from AiProviderConfig and has a deterministic test provider.
3. Vector generation fails closed when no active SearchIndexProfile exists, the profile is not active, provider config is unavailable, dimensions mismatch, or the snippet/profile state would mix incompatible semantic spaces.
4. Vector candidate retrieval only compares embeddings from the same active SearchIndexProfile and returns explainable debug evidence.
5. Existing lexical retrieval and public citation API remain compatible.
6. pgvector migration/readiness, Prisma validation, focused tests, lint, full tests, and build pass, or an environment-specific blocker is recorded with recovery steps.

## Constraints

- Do not expose embedding provider secrets to client code or test evidence.
- Do not compare vectors across different SearchIndexProfile ids, provider/model names, or dimensions.
- Do not claim production reindex support or background queue behavior.
- Do not raw-score-add lexical and vector results; fusion is WT-086 scope.
- Do not bypass knowledge base/source/snippet filters to improve recall.
- Do not activate or accept MS-10; fdch0 retains milestone final acceptance.

## Verification Requirements

- `npx prisma generate --schema prisma/schema.prisma`
- `npx prisma validate --schema prisma/schema.prisma`
- PostgreSQL migration apply/status check against a disposable or test database
- `npm run search:extensions`
- `npm run postgres:readiness`
- Focused embedding/vector tests
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- pgvector migration cannot apply cleanly to PostgreSQL.
- Prisma schema cannot represent the vector persistence boundary safely.
- Vector generation can silently mix different profile/model/dimension spaces.
- Existing lexical retrieval or knowledge upload/snippet tests regress.
