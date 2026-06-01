# MS-13 Runtime Operator Runbook

## Scope

This runbook is the operator entrypoint for the MS-13 local Docker Compose
runtime bundle:

- `postgres`: PostgreSQL 16 with pgvector through `pgvector/pgvector:0.8.2-pg16`
- `web`: the ReqFlow Next.js standalone image built from `Dockerfile`
- `embedding`: optional local CPU embedding sidecar under the `embedding` profile

It is a local inspection and smoke-validation path. It is not production
deployment, backup/restore, production secret management, production migration
automation, or volume/model-cache cleanup automation.

## Quick Path

PowerShell:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.runtime.yml up -d --build postgres web

$env:RUNTIME_POSTGRES_PORT = "5432"
$env:RUNTIME_WEB_URL = "http://127.0.0.1:3000/login"
$env:RUNTIME_RUN_SEED = "true"
npm run runtime:smoke
```

Open `http://localhost:3000/login` after the smoke passes.

The seeded local accounts are documented in `README.md`. Do not send test
account passwords to AI providers.

## Port-Safe Local Run

Use alternate host ports when local PostgreSQL or web ports are already in use.

PowerShell:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
$env:POSTGRES_PORT = "55432"
$env:REQFLOW_WEB_PORT = "3300"
docker compose -f docker-compose.runtime.yml up -d --build postgres web

$env:RUNTIME_POSTGRES_PORT = "55432"
$env:RUNTIME_WEB_URL = "http://127.0.0.1:3300/login"
$env:RUNTIME_RUN_SEED = "true"
npm run runtime:smoke
```

The smoke script does not start, stop, reset, remove, or prune containers,
volumes, uploads, model cache, or database state. It waits for PostgreSQL, runs
`prisma migrate deploy`, optionally runs seed, checks PostgreSQL/search
readiness, and performs an HTTP smoke against the configured web URL.

## Validate Compose Config

PowerShell:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.runtime.yml config
```

With the optional embedding sidecar profile:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.runtime.yml --profile embedding config
```

## Database Setup

The web container does not run migrations or seed on startup. Run setup from
the host as an explicit operator step.

Default port:

```powershell
$env:DATABASE_URL = "postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public"
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:seed
```

Alternate port example:

```powershell
$env:DATABASE_URL = "postgresql://reqflow:reqflow@127.0.0.1:55432/reqflow_dev?schema=public"
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:seed
```

## Logs And Status

```powershell
docker compose -f docker-compose.runtime.yml ps
docker compose -f docker-compose.runtime.yml logs --tail 120 postgres
docker compose -f docker-compose.runtime.yml logs --tail 120 web
```

For the optional sidecar:

```powershell
docker compose -f docker-compose.runtime.yml --profile embedding logs --tail 120 embedding
```

## Stop Without Deleting State

Use `stop` when you want to keep local database state, uploads, and model cache:

```powershell
docker compose -f docker-compose.runtime.yml stop web postgres
```

If the optional embedding sidecar is running:

```powershell
docker compose -f docker-compose.runtime.yml --profile embedding stop embedding web postgres
```

Do not use `down -v`, `volume rm`, `system prune`, or manual cache deletion as
part of the standard runtime bundle flow. Deleting volumes or model cache needs
an explicit operator decision because those locations can contain local database
state, uploads, and downloaded model files.

## Optional Embedding Sidecar

Start the sidecar only when intentionally validating the local CPU embedding
path. The first run can download a large model into
`reqflow-embedding-model-cache`.

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.runtime.yml --profile embedding up -d --build
```

Probe the sidecar from the host:

```powershell
$env:LOCAL_EMBEDDING_BASE_URL = "http://127.0.0.1:8081"
$env:LOCAL_EMBEDDING_PATH = "/embed"
$env:LOCAL_EMBEDDING_REQUEST_FORMAT = "tei"
$env:LOCAL_EMBEDDING_MODEL = "intfloat/multilingual-e5-large"
$env:LOCAL_EMBEDDING_DIMENSIONS = "1024"
npm run embedding:probe
```

Include the probe in runtime smoke only after the sidecar is already running:

```powershell
$env:RUNTIME_PROBE_EMBEDDING = "true"
npm run runtime:smoke
```

The embedding sidecar remains optional and non-default. The web image does not
contain embedding model weights.

## Search Runtime Boundary

The MS-13 default runtime uses pgvector and PostgreSQL native FTS fallback.
BM25 is not enabled in `docker-compose.runtime.yml`.

Use the normal readiness check for the current runtime:

```powershell
npm run search:extensions
```

Use strict BM25 candidate mode only for a future target image that is expected
to expose a supported BM25 extension:

```powershell
$env:SEARCH_REQUIRE_BM25_EXTENSION = "true"
npm run search:extensions
```

In the current MS-13 runtime, strict BM25 candidate mode is expected to fail
because no BM25 extension candidate is packaged by default.

## Troubleshooting

| Symptom | Check | Expected operator action |
| --- | --- | --- |
| Compose fails with `AUTH_SECRET` missing | `docker compose -f docker-compose.runtime.yml config` | Set `AUTH_SECRET` in the shell and rerun. |
| PostgreSQL port is already allocated | `docker compose -f docker-compose.runtime.yml ps` | Set `POSTGRES_PORT` to an unused host port and pass the same value through `RUNTIME_POSTGRES_PORT`. |
| Web port is already allocated | Browser cannot open `localhost:3000` or compose reports bind failure | Set `REQFLOW_WEB_PORT` and use the same port in `RUNTIME_WEB_URL`. |
| Login page returns an error after containers start | `docker compose -f docker-compose.runtime.yml logs --tail 120 web` | Run `npm run runtime:smoke` or run migrations and seed explicitly. |
| Search readiness says `pg_search` or BM25 candidates are unavailable | `npm run search:extensions` | Treat this as the expected current fallback boundary; do not claim BM25 behavior. |
| Embedding probe times out | Sidecar logs and first-run model download progress | Wait for the model download, verify `LOCAL_EMBEDDING_*` variables, then rerun `npm run embedding:probe`. |
| Docker image build reports Turbopack native binding unavailable | `docker compose -f docker-compose.runtime.yml build web` | The Dockerfile should use `npm run build:webpack`; rerun after pulling the WT-112 fix. |

## References

- Compose bundle contract: `docs/docker-compose-runtime-bundle.md`
- Web image environment contract: `docs/docker-web-runtime-env.md`
- BM25 feasibility decision: `docs/ms13-bm25-runtime-feasibility.md`
- Search readiness boundary: `docs/search-extension-readiness.md`
- Optional embedding sidecar PoC: `docs/local-embedding-sidecar-poc.md`
