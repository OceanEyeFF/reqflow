# Gate Evidence: WT-20260529-083

## Metadata

- worktrack_id: WT-20260529-083
- title: Knowledge search index schema、SearchIndexProfile 与 metadata migration
- milestone_id: MS-10
- branch: worktrack/wt-20260529-083-knowledge-search-index-schema
- status: in-validation

## Implementation Evidence

- Added Prisma models:
  - `EmbeddingProviderConfig`
  - `SearchIndexProfile`
  - `KnowledgeSnippetSearchMetadata`
  - `KnowledgeEmbedding`
- Added migration: `prisma/migrations/20260531171610_add_search_index_schema/migration.sql`
- Added focused schema tests: `src/lib/knowledge/search-index-schema.test.ts`
- Updated test cleanup to remove new search-index tables before existing knowledge records.
- Added rollback/schema notes: `docs/ms10-search-index-schema.md`

## Validation Evidence

- `npm ci`: pass.
- `npx prisma generate --schema prisma/schema.prisma`: pass.
- `npx prisma validate --schema prisma/schema.prisma`: pass.
- `npx prisma migrate deploy --schema prisma/schema.prisma`: pass; applied `20260531171610_add_search_index_schema`.
- `npx vitest run src/lib/knowledge/search-index-schema.test.ts`: pass, 1 file / 2 tests.

## Pending Validation

- `npx prisma migrate status --schema prisma/schema.prisma`: pass; database schema is up to date.
- `npm run postgres:readiness`: pass.
- `npm run lint`: pass.
- `npm run test`: pass, 29 files / 203 tests.
- `npm run build`: pass; only known Next.js multi-lockfile worktree warning.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.

## Policy Review

- Scope stayed within schema, migration, rollback notes, and focused validation.
- Existing knowledge-base/source/version/snippet tables and data are preserved.
- Retrieval runtime, query understanding, embeddings generation, vector column/index implementation, fusion, context expansion, and AI draft integration are deferred to later MS-10/MS-11 worktracks.
- Embedding provider config is separate from chat provider config.
- Embedding records are profile-scoped and unique per snippet/profile.
- `pg_search` availability is not claimed by this worktrack.
- No external hosted search, external vector database, external reranking provider, background queue, or production reindex was introduced.
