# Gate Evidence: WT-20260601-119

## Metadata

- worktrack_id: WT-20260601-119
- milestone_id: MS-14
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- Added `scripts/pg-textsearch-compat-poc.mjs` and `npm run pg-textsearch:poc`.
- The probe starts `postgres:18` in a temporary isolated Docker container on `127.0.0.1:55441` by default.
- The probe mounts no host data volume and removes the temporary container by default.
- Added `docs/ms14-pg-textsearch-compat-results.json` with compatibility evidence.
- Added `docs/ms14-pg-textsearch-compat-poc.md` with runtime facts, decision, impact on MS-14, and non-claim boundaries.

## Candidate Runtime Evidence

- Docker image tested: `postgres:18`.
- PostgreSQL version: `18.4 (Debian 18.4-1.pgdg13+1)`.
- `shared_preload_libraries`: empty.
- `pg_textsearch` in `pg_available_extensions`: no.
- `CREATE EXTENSION pg_textsearch`: not attempted because the extension is unavailable.
- Decision: `defer`; custom image/package installation path would be required before query/index/benchmark testing.

## Validation Evidence

- `node --check scripts/pg-textsearch-compat-poc.mjs`: pass.
- `npm run pg-textsearch:poc`: pass; compatibility result written.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Policy/non-claim scan: pass; matches are explicit defer/default-runtime boundaries.
- Docker cleanup check: no containers with label `reqflow.ms14=pg-textsearch-compat-poc` remain after the probe.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-119-pg-textsearch-poc`.
- `docker-compose.runtime.yml` was not modified.
- No custom image was built in this worktrack.
- No package was installed into existing containers.
- No MS-13 default Docker volume was mounted or migrated.
- No uploads, model cache, or existing database state were touched.
- Default ReqFlow runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- `pg_textsearch` is deferred due to runtime packaging availability.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass; candidate decision is defer
