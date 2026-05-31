# Gate Evidence: WT-20260531-094

## Metadata

- worktrack_id: WT-20260531-094
- title: MS-9 代码验收与集成风险审查
- milestone_id: MS-9
- node_type: review
- status: in_progress
- created_at: 2026-05-31
- carrier_decision: current-carrier with explorer sidecar

## Review Scope

- Baseline: `629f7c7232e425d08484877593222cbeaec2ec1f`
- Review head: `443ba05f51dcfe647729606195c04e951d084699` plus WT-094 review artifacts
- Areas: Prisma PostgreSQL migration, Docker/CI PostgreSQL and pgvector readiness, search extension readiness, retrieval evaluation harness, package scripts, MS-9 docs, and scope boundary compliance.

## Findings

Initial local review found no critical, high, or medium acceptance blockers. The sidecar review then identified acceptance blockers that were fixed in this worktrack.

Resolved blocker findings:

1. Retrieval result gate previously accepted self-reported `recallAt5` / `noiseAt5` without deriving them from returned source/snippet IDs.
   - severity: blocker
   - fix: `scripts/retrieval-evaluation-gate.mjs` now derives recall/noise from top-5 returned source/snippet IDs, requires expected sources/snippets, requires `matchedTerms`, and ignores self-reported metrics.
   - regression: `.servo/worktrack/WT-20260531-094/retrieval-result-cheat.json` is rejected as expected.
2. Local PostgreSQL test baseline previously pointed users and helper defaults at `reqflow_test`, but `docker-compose.postgres.yml` creates only `reqflow_dev`.
   - severity: blocker
   - fix: `src/test/api-test-helpers.ts` now defaults to `reqflow_dev`; `docs/prisma-postgres-provider-boundary.md` now documents `reqflow_dev` as the local test base.
   - regression: `npm run test` passes with `TEST_DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev`.
3. Search extension readiness previously created database-scoped extensions in the caller's database while the docs described schema isolation.
   - severity: high
   - fix: `scripts/search-extension-readiness.mjs` now creates a temporary probe database, verifies extensions inside it, then drops it. `docs/search-extension-readiness.md` now documents database-scoped extension behavior and warns against production URLs.
   - regression: `npm run search:extensions` passes and `SELECT datname FROM pg_database WHERE datname LIKE 'reqflow_ext_%'` returns `[]`.

Low / residual items after fixes:

- The first local `npm run test` attempt failed because the new WT-094 worktree had no local `node_modules`; after `npm ci`, the command advanced to the database layer. This is a worktree setup requirement, not a code failure.
- `docs/ms8-addendum-final-validation.md` still records historical SQLite validation facts from MS8. It is not an active MS-9 path and current MS-9 docs point to PostgreSQL.
- Remote GitHub Actions execution after WT-082/WT-094 was not observed in this local worktrack.

## Validation Evidence

- `node --check scripts/postgres-readiness.mjs`: pass.
- `node --check scripts/search-extension-readiness.mjs`: pass.
- `node --check scripts/retrieval-evaluation-gate.mjs`: pass.
- `node --check scripts/wait-for-postgres.mjs`: pass.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json .servo/worktrack/WT-20260531-094/retrieval-result-positive.json`: pass, 5 results validated.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json .servo/worktrack/WT-20260531-094/retrieval-result-cheat.json`: rejected as expected because derived recall fails.
- `git diff --check`: pass; only local LF to CRLF warnings for edited `.servo` files.
- `npx prisma validate --schema prisma/schema.prisma` without `DATABASE_URL`: failed as expected because Prisma requires `DATABASE_URL`.
- `npx prisma validate --schema prisma/schema.prisma` with `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public`: pass.
- `npx prisma migrate status --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`: pass; 7 migrations found and schema is up to date.
- `npm run postgres:readiness` with PostgreSQL `DATABASE_URL`: pass; Prisma validate and migrate status pass.
- `npm run search:extensions` with PostgreSQL `DATABASE_URL` and isolated `SEARCH_EXTENSION_DATABASE_URL`: pass; pgvector pass, native PostgreSQL FTS pass, `pg_search` unavailable fallback recorded.
- Temporary probe database cleanup check: `SELECT datname FROM pg_database WHERE datname LIKE 'reqflow_ext_%'` returned `[]`.
- `npm run lint`: pass.
- `npm ci`: pass; npm emitted registry TLS notice and a Windows cleanup EPERM warning.
- `npm run test` after dependency install with `TEST_DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev`: pass, 28 files / 201 tests.
- `npm run build` with PostgreSQL `DATABASE_URL`: pass; known Next.js multi-lockfile worktree warning only.
- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`: pass and generated PostgreSQL DDL.

## Boundary Evidence

- MS-9 diff from baseline changes `.github/workflows/ci.yml`, Prisma schema/migrations, PostgreSQL/search readiness scripts, test DB helpers, package scripts, and docs/control artifacts.
- No runtime files under `src/app/api/ai`, `src/lib/ai`, `src/lib/knowledge`, `src/app/api/knowledge`, or `src/app/api/admin/knowledge` changed in the MS-9 diff.
- `prisma/schema.prisma` uses `provider = "postgresql"`.
- `.github/workflows/ci.yml` uses `pgvector/pgvector:0.8.2-pg16` for baseline, postgres-readiness, and search-extension-readiness jobs.
- `scripts/search-extension-readiness.mjs` proves vector extension, HNSW DDL, native PostgreSQL FTS fallback, and treats `pg_search` as optional unless `SEARCH_REQUIRE_PG_SEARCH=true`.
- `scripts/retrieval-evaluation-gate.mjs` validates selected knowledge-base IDs, expected source/snippet IDs, must-contain terms, forbidden source IDs, recall/noise thresholds, and citation traceability.
- Existing AI draft manual confirmation and knowledge filtering behavior are not modified by MS-9.
- No production data migration, external hosted search service, third-party vector database, provider billing decision, or active embedding profile switch was performed.

## Sidecar Review

- Sidecar reviewer found the three blocker/high findings listed above.
- Sidecar residual risks retained:
  - Migration history is now PostgreSQL-compatible and not an in-place SQLite-to-PostgreSQL production data migration path.
  - Corpus/debug evidence enforcement beyond returned IDs, matched terms, forbidden sources, thresholds, and citation traceability remains for MS-10/MS-11 result-generation contracts.
  - README quick start can still be clearer about required `DATABASE_URL`; current detailed PostgreSQL docs cover it, but README operator polish may be useful later.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass
