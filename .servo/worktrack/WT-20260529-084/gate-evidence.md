# Gate Evidence: WT-20260529-084

## Metadata

- worktrack_id: WT-20260529-084
- title: Query understanding 与 Lexical BM25/FTS 检索实现
- milestone_id: MS-10
- branch: worktrack/wt-20260529-084-lexical-bm25-fts-search
- status: in-validation

## Implementation Evidence

- Added deterministic query understanding in `src/lib/knowledge/retrieval.ts`.
- Added lexical-only retrieval debug evidence through `retrieveKnowledgeSnippets`.
- Preserved the existing `selectKnowledgeSnippets` citation API for AI draft callers.
- Added metadata-aware lexical matching that uses `KnowledgeSnippetSearchMetadata.lexicalText` when present and falls back to snippet content for legacy rows.
- Kept native PostgreSQL FTS fallback boundary explicit through `postgres-native-fts-fallback` evidence labels; no BM25/pg_search readiness is claimed.
- Added focused tests in `src/lib/knowledge/retrieval.test.ts` for Chinese tokenization, query understanding, metadata lexical matching, selected knowledge-base filters, and debug evidence.

## Validation Evidence

- `npm ci`: pass.
- `npx prisma generate --schema prisma/schema.prisma`: pass.
- `npx vitest run src/lib/knowledge/retrieval.test.ts`: pass, 1 file / 12 tests.
- `npm run lint`: pass.

## Pending Validation

- `npm run postgres:readiness`: pass.
- `npm run test`: pass, 29 files / 207 tests.
- `npm run build`: pass; only known Next.js multi-lockfile worktree warning.

## Policy Review

- Scope stayed within query understanding and lexical retrieval.
- Vector generation, pgvector search, RRF fusion, context expansion, evaluation harness expansion, and AI draft integration are deferred to later worktracks.
- Existing enabled/ready/selected knowledge-base filters remain enforced in the Prisma query.
- Debug evidence records real matched terms, ranks, filters, caps, and engine labels without provider secrets.
- Returned citations are still grounded in selected snippets.
- No external search service, external reranker, background queue, or production reindex was introduced.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
