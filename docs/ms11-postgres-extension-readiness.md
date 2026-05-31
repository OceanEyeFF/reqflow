# MS-11 PostgreSQL / Extension Readiness

## Metadata

- worktrack_id: WT-20260529-092
- milestone_id: MS-11
- status: pass
- updated: 2026-05-31
- database_url: `postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public`

## Readiness Results

| Lane | Command | Result |
|---|---|---|
| Prisma schema | `npm run postgres:readiness` | pass; schema valid |
| Prisma migration status | `npm run postgres:readiness` | pass; 9 migrations found, database schema up to date |
| PostgreSQL server | `npm run search:extensions` | pass; PostgreSQL 16.14 |
| pgvector | `npm run search:extensions` | pass; extension `vector` 0.8.2 installed/available, vector distance ordering and HNSW index probe pass |
| Native PostgreSQL FTS | `npm run search:extensions` | pass; `to_tsvector('simple')` / `websearch_to_tsquery('simple')` fallback probe finds expected Chinese-token row |
| pg_search | `npm run search:extensions` | unavailable in current image; native PostgreSQL FTS fallback is required and passed |
| Retrieval corpus | `npm run retrieval:evaluate` | pass; 5 cases validated |
| Focused retrieval/AI/debug tests | `npm run test -- src/lib/knowledge/retrieval.test.ts src/lib/knowledge/embeddings.test.ts src/app/api/ai/draft/route.test.ts src/app/api/admin/knowledge/search/route.test.ts` | pass; 4 files / 53 tests |
| Full test suite | `npm run test` | pass; 31 files / 242 tests |
| Lint | `npm run lint` | pass |
| Build | `npm run build` | pass; non-blocking Next.js worktree root warning due local worktree lockfile |
| Diff hygiene | `git diff --check` | pass |

## Gate Interpretation

- PostgreSQL is the active Prisma provider and the local readiness target is reachable.
- Current migrations are applied to the local PostgreSQL readiness database.
- pgvector is available and operational for the MS-10/MS-11 vector retrieval path.
- Native PostgreSQL FTS fallback is operational and remains the required lexical fallback because `pg_search` is not available in the current image.
- Retrieval evaluation corpus still covers lexical fallback, selected scope, semantic/fusion, forbidden source, and citation traceability.
- AI draft and admin debug evidence tests remain compatible with the readiness baseline.

## Residual Risks

- This is local PostgreSQL readiness evidence, not remote CI or production database evidence.
- `pg_search` is unavailable in the current local image; this is acceptable because the implemented path uses native PostgreSQL FTS fallback.
- The Next.js build warning about inferred root is caused by the temporary worktree lockfile after `npm install`; it does not affect the committed repo baseline.

