# Worktrack Contract: WT-20260529-083

## Metadata

- worktrack_id: WT-20260529-083
- title: Knowledge search index schema、SearchIndexProfile 与 metadata migration
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: migration
- status: initialized
- priority: 1
- branch: worktrack/wt-20260529-083-knowledge-search-index-schema
- baseline_branch: develop
- baseline_ref: 64b23419b263f5d4aa21c007e6efd06b2886138b
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-9 is completed and accepted; PostgreSQL is the active Prisma provider baseline; MS-10 is active.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records MS-10 active and WT-20260529-083 as the next worktrack.
- milestone_purpose_alignment: WT-083 establishes the index schema and migration baseline required before lexical/vector retrieval implementation worktracks.
- historical_conflict_risk: Low; superseded lightweight retrieval work is not active. Existing knowledge models must remain compatible and no data deletion is in scope.
- worktrack_adjustment_recommendations: Keep WT-083 focused on schema, migration, metadata fields, rollback notes, and seed/test readiness. Defer query, embedding generation, fusion, context builder, and evaluation runtime to WT-084 through WT-088.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add Prisma schema models and relations for search index profiles and snippet-level searchable metadata.
- Add a PostgreSQL migration for the new schema surface.
- Preserve existing knowledge-base/source/snippet compatibility.
- Add rollback notes and operator-facing schema notes for this migration.
- Add focused tests or schema validation that prove invariants around SearchIndexProfile identity, dimensions, status, metadata, and snippet binding.
- Update relevant MS-10/WT-083 artifacts with validation evidence.

### Out of Scope

- Runtime query understanding.
- Lexical BM25/FTS retrieval implementation.
- Embedding provider calls or vector generation.
- RRF fusion, reranker behavior, context expansion, AI draft integration, or admin debug UI.
- Production data migration execution or bulk production reindex.
- External hosted search, external vector databases, external reranking providers, or background queues.

## Affected Modules

- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/lib/knowledge/`
- `docs/`
- `.servo/worktrack/WT-20260529-083/`

## Node Policy

- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-migration-branch
- merge_required: yes
- gate_criteria: schema + migration + validation + rollback notes
- if_interrupted_strategy: checkpoint-or-recover

## Acceptance Criteria

1. Prisma schema includes SearchIndexProfile-equivalent state with provider/model/dimensions/semantic-space/lexical-engine/status immutability boundaries documented.
2. Search index metadata can represent `domainEntities`, `processNames`, `materialTypes`, `approvalActions`, `applicabilityRules`, `sourcePath`, `section`, and `documentTitle` for snippets.
3. Schema prevents silent cross-profile vector comparison by requiring profile binding on vector/search index records.
4. Existing knowledge source/snippet import semantics remain intact.
5. Migration has rollback notes and does not delete existing business data.
6. `npx prisma validate --schema prisma/schema.prisma` passes.
7. PostgreSQL migration status/readiness and focused tests pass, or any environment-specific blocker is recorded with recovery steps.

## Constraints

- Do not remove existing tables or fields in this worktrack.
- Do not expose embedding provider secrets to client code.
- Do not claim `pg_search` availability without readiness evidence.
- Do not implement retrieval runtime in this worktrack.
- Do not activate or accept MS-10; fdch0 retains milestone final acceptance.

## Verification Requirements

- `npx prisma validate --schema prisma/schema.prisma`
- PostgreSQL migration apply/status check against a disposable or test database
- Focused unit/schema tests for new metadata/profile invariants where practical
- `npm run lint`
- `npm run test`
- `npm run build`

## Rollback Conditions

- Migration cannot apply cleanly to PostgreSQL.
- New schema requires destructive data loss.
- New model shape makes later WT-084 through WT-088 scope impossible without redesign.
- Existing knowledge upload/snippet tests regress.

