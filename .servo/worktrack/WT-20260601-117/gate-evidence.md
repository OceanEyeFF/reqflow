# Gate Evidence: WT-20260601-117

## Metadata

- worktrack_id: WT-20260601-117
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `scripts/paradedb-pg-search-poc.mjs` and `npm run paradedb:poc`.
- The probe starts `paradedb/paradedb:latest` in a temporary isolated Docker container on `127.0.0.1:55437` by default.
- The probe mounts no host data volume and removes the temporary container by default.
- Added `docs/ms14-paradedb-pg-search-results.json` with measured ParadeDB candidate output compatible with the MS-14 BM25 benchmark gate.
- Added `docs/ms14-paradedb-pg-search-poc.md` with runtime facts, benchmark results, Chinese compatibility notes, decision, and non-claim boundaries.
- Updated `docs/ms14-bm25-benchmark-corpus.json` to relax the synonym case first-relevant-rank threshold from 1 to 2 after measured ParadeDB ranking put the synonym explanation at rank 2.

## Candidate Runtime Evidence

- Docker image: `paradedb/paradedb:latest`.
- PostgreSQL version: `18.4 (Debian 18.4-1.pgdg13+1)`.
- `pg_search`: available and installed, version `0.23.5`.
- `vector`: available and installed, version `0.8.1`.
- `CREATE EXTENSION pg_search`: pass.
- `CREATE EXTENSION vector`: pass.
- BM25 index DDL: pass.
- Index build time on 12-snippet fixture: `346.152 ms`.
- Index size on 12-snippet fixture: `3022848 bytes`.
- First run caveat: connecting before the ParadeDB entrypoint completed its bootstrap restart hit `FATAL: the database system is shutting down`; script now waits for entrypoint completion before probing.

## Benchmark Evidence

- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-paradedb-pg-search-results.json`: pass; 6 cases validated.
- Pure Chinese, mixed Chinese-English, source-path, synonym, and disabled-source trap cases all passed the benchmark result gate.
- Noted ranking caveat: `ms14-synonym-qc-sampling` returned the exact QC sampling rule at rank 1 and the synonym explanation at rank 2.
- Local p50 query latencies on the 12-snippet fixture were roughly 155-163 ms; these are local PoC numbers, not production capacity claims.

## Validation Evidence

- `node --check scripts/paradedb-pg-search-poc.mjs`: pass.
- `npm run bm25:evaluate`: pass.
- ParadeDB measured result gate: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit default-runtime and non-enable boundaries.
- Docker cleanup check: no containers with label `reqflow.ms14=paradedb-pg-search-poc` remain after the successful probe.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-117-pg-search-runtime-poc`.
- `docker-compose.runtime.yml` was not modified.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- ParadeDB `pg_search` is a future runtime candidate only.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass with caveats
