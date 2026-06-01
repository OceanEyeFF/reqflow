# MS-15 ParadeDB Operator Runbook

## Scope

This runbook covers the MS-15 ParadeDB candidate runtime path:

- `docker-compose.paradedb.yml`;
- ParadeDB PostgreSQL 18.4 candidate image pinned by digest;
- `pg_search` 0.23.5;
- `vector` 0.8.1;
- alternate host ports by default: PostgreSQL `55437`, web `3307`;
- separate candidate volumes.

It is a candidate validation path. It is not the accepted default runtime, not a
production migration plan, and not a volume cleanup guide.

## Candidate Start

PowerShell:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
$env:POSTGRES_PORT = "55437"
$env:REQFLOW_WEB_PORT = "3307"
docker compose -f docker-compose.paradedb.yml up -d --build postgres web
```

The candidate database volume is mounted at `/var/lib/postgresql`, which is the
PostgreSQL 18 Docker image layout. Do not mount a PostgreSQL 16-era data path at
`/var/lib/postgresql/data`.

## Candidate Smoke

```powershell
$env:RUNTIME_POSTGRES_PORT = "55437"
$env:RUNTIME_WEB_URL = "http://127.0.0.1:3307/login"
$env:RUNTIME_RUN_SEED = "true"
npm run runtime:smoke
```

Strict extension readiness:

```powershell
$env:SEARCH_REQUIRE_PG_SEARCH = "true"
$env:SEARCH_EXTENSION_DATABASE_URL = "postgresql://reqflow:reqflow@127.0.0.1:55437/reqflow_dev?schema=public"
npm run search:extensions
```

Chinese BM25 benchmark:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
npm run paradedb:candidate-benchmark
npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json
```

Hybrid invariant comparison:

```powershell
npm run paradedb:hybrid-comparison
```

## Candidate Stop

Stop without deleting state:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.paradedb.yml stop web postgres
```

Do not use `down -v`, `volume rm`, `system prune`, or manual cache deletion as
part of this runbook.

## Rollback To MS-13 Default Runtime

The accepted MS-13 default runtime remains `docker-compose.runtime.yml` with
PostgreSQL 16 + pgvector and native FTS fallback. To return to it:

1. Stop the ParadeDB candidate services with `docker compose -f docker-compose.paradedb.yml stop web postgres`.
2. Start the default runtime:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.runtime.yml up -d --build postgres web
```

3. Run the default runtime smoke:

```powershell
$env:RUNTIME_POSTGRES_PORT = "5432"
$env:RUNTIME_WEB_URL = "http://127.0.0.1:3000/login"
$env:RUNTIME_RUN_SEED = "true"
npm run runtime:smoke
```

If default ports are busy, use the alternate-port guidance in
`docs/ms13-runtime-operator-runbook.md`.

## Data Boundary

Do not mount, migrate, or reuse:

- MS-13 default `reqflow-postgres-data` inside ParadeDB;
- production data volumes;
- local uploads or model cache as part of candidate cleanup.

The candidate runtime uses separate compose project volumes. Leaving stopped
candidate volumes in place is safer than deleting data during validation.

## Decision Boundary

Any default runtime switch still requires fdch0 approval. A future switch would
need a separate implementation worktrack that updates app retrieval behavior,
reruns hybrid retrieval gates against the new lexical lane, and defines an
explicit data migration/rollback plan.
