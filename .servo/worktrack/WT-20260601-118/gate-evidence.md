# Gate Evidence: WT-20260601-118

## Metadata

- worktrack_id: WT-20260601-118
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `scripts/vectorchord-bm25-poc.mjs` and `npm run vectorchord:poc`.
- The probe starts `tensorchord/vchord-suite:pg18-latest` in a temporary isolated Docker container on `127.0.0.1:55439` by default.
- The probe mounts no host data volume and removes the temporary container by default.
- Added `docs/ms14-vectorchord-bm25-results.json` with measured VectorChord candidate output.
- Added `docs/ms14-vectorchord-bm25-poc.md` with runtime facts, benchmark failure, Chinese compatibility notes, decision, and non-claim boundaries.

## Candidate Runtime Evidence

- Docker image: `tensorchord/vchord-suite:pg18-latest`.
- PostgreSQL version: `18.3 (Debian 18.3-1.pgdg12+1)`.
- `pg_tokenizer`: available and installed, version `0.1.1`.
- `vchord_bm25`: available and installed, version `0.3.0`.
- `vector`: available and installed, version `0.8.2`.
- `CREATE EXTENSION pg_tokenizer CASCADE`: pass.
- `CREATE EXTENSION vchord_bm25 CASCADE`: pass.
- `CREATE EXTENSION vector CASCADE`: pass.
- Jieba analyzer/custom tokenizer setup: pass.
- BM25 index DDL: pass.
- Index build time on 12-snippet fixture: `386.583 ms`.
- Index size on 12-snippet fixture: `1433600 bytes`.
- Query API caveat: current image exposes `to_bm25query(regclass, bm25vector)` rather than the initially attempted `bm25query(regclass, integer[])`; probe was adjusted accordingly.

## Benchmark Evidence

- `npm run bm25:evaluate`: pass; corpus remains valid.
- `node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-vectorchord-bm25-results.json`: expected fail.
- Failure: `ms14-synonym-qc-sampling.derivedRecallAt5 must be a number between 1 and 1`.
- The synonym case returned `snip-quality-synonym-sampling` and `snip-consumables-standard-inspection` in top 5, but `snip-direct-outbound-allowed` ranked 7th.
- Pure Chinese, mixed Chinese-English, source-path, and disabled-source cases produced relevant top results.
- Local p50 query latencies on the 12-snippet fixture were roughly 152-164 ms; these are local PoC numbers, not production capacity claims.

## Validation Evidence

- `node --check scripts/vectorchord-bm25-poc.mjs`: pass.
- `npm run bm25:evaluate`: pass.
- VectorChord measured result gate: fail as expected for candidate quality; recorded as defer evidence, not a harness failure.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Docker cleanup check: no containers with label `reqflow.ms14=vectorchord-bm25-poc` remain after the successful probe.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-118-vectorchord-bm25-poc`.
- `docker-compose.runtime.yml` was not modified.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- VectorChord-BM25 is deferred pending tokenizer/query tuning evidence.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass with expected candidate-quality failure recorded
- policy-gate: pass
- final: pass; candidate decision is defer
