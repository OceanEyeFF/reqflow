# Gate Evidence: WT-20260529-081

## Metadata

- worktrack_id: WT-20260529-081
- title: pgvector 与 BM25/FTS extension readiness
- milestone_id: MS-9
- node_type: architecture
- status: pass
- created_at: 2026-05-31
- carrier_decision: current-carrier

## Implementation Evidence

- Updated local and CI PostgreSQL service image to `pgvector/pgvector:0.8.2-pg16`.
- Added `scripts/search-extension-readiness.mjs`.
- Added `npm run search:extensions`.
- Added GitHub Actions `search-extension-readiness` job.
- Added `docs/search-extension-readiness.md`.
- Updated hybrid search ADR with pgvector readiness baseline.

## Boundary Evidence

- No application retrieval implementation was added.
- No SearchIndexProfile, embedding provider, vector table, lexical index table, query-understanding, RRF, context builder, or debug evidence schema was added.
- `pg_search` is detected but not required by default.
- Current baseline records `pg_search` as unavailable in the dev/test/CI image and selects PostgreSQL native FTS plus Chinese tokenization/normalization fallback.
- No production extension rollout or managed database provider decision was made.

## Validation Evidence

- `docker compose -f docker-compose.postgres.yml up -d --force-recreate postgres`: pass after stopping the older WT-080 container that occupied port 5432.
- `npm run postgres:wait`: pass.
- `node --check scripts/search-extension-readiness.mjs`: pass.
- `git diff --check`: pass.
- `npx prisma migrate deploy --schema prisma/schema.prisma` against PostgreSQL `public` schema: pass.
- `npm run postgres:readiness`: pass.
- `npm run search:extensions`: pass.
  - PostgreSQL version observed: 16.14.
  - `vector` extension available: yes, default version 0.8.2.
  - pgvector probe: vector type, distance ordering, and HNSW index DDL pass.
  - native PostgreSQL FTS probe: pre-tokenized Chinese fallback text search and GIN index DDL pass.
  - `pg_search`: unavailable in current image; fallback required.
- `npm run lint`: pass.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL`: pass, 28 files / 201 tests.
- `npm run build`: pass with existing Next.js multi-lockfile worktree warning only.

## Gate Verdict

- implementation-gate: pass
- feasibility-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass

## Residual Risks

- `pg_search` BM25 is not available in the current image. MS-10 must not claim BM25 behavior unless target deployment proves `pg_search` install/preload readiness.
- Native PostgreSQL FTS fallback requires tokenized/normalized Chinese lexical text; WT-082 must catch recall/noise gaps.
- Production extension rollout and managed PostgreSQL provider compatibility remain separate decisions.
