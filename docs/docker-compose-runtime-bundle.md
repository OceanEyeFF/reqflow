# Docker Compose Runtime Bundle

## Scope

This MS-13 runtime bundle brings the ReqFlow web image, PostgreSQL/pgvector,
and the optional local embedding sidecar into one Compose file:
`docker-compose.runtime.yml`.

This is still a local/operator runtime path. It is not production deployment,
backup/restore, cloud secret management, migration automation, seed automation,
BM25 runtime selection, or destructive volume/cache cleanup.

## Services

| Service | Default image/build | Purpose |
| --- | --- | --- |
| `postgres` | `pgvector/pgvector:0.8.2-pg16` | PostgreSQL 16 with pgvector for the current Prisma provider and vector lane readiness. |
| `web` | builds `Dockerfile` as `reqflow-web:local` | Next.js standalone web app from WT-20260601-108. |
| `embedding` | `ghcr.io/huggingface/text-embeddings-inference:cpu-1.9` | Optional local CPU embedding sidecar under the `embedding` profile. |

## Required Variables

Set `AUTH_SECRET` before starting the web service:

```bash
AUTH_SECRET="replace-with-a-local-secret"
```

The runtime bundle provides local development defaults for PostgreSQL:

| Variable | Default |
| --- | --- |
| `POSTGRES_DB` | `reqflow_dev` |
| `POSTGRES_USER` | `reqflow` |
| `POSTGRES_PASSWORD` | `reqflow` |
| `POSTGRES_PORT` | `5432` |
| `REQFLOW_WEB_PORT` | `3000` |

Provider secrets such as `DEEPSEEK_API_KEY` remain optional and must be supplied
through the runtime environment, never through image build args.

## Start Web + PostgreSQL

Build and start the local runtime bundle:

```bash
AUTH_SECRET="replace-with-a-local-secret" docker compose -f docker-compose.runtime.yml up -d --build postgres web
```

Then apply database setup as a separate operator step:

```bash
DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public" npx prisma migrate deploy --schema prisma/schema.prisma
DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public" npm run db:seed
```

Open http://localhost:3000/login after migrations and seed complete.

For a local smoke that performs the same setup checks without deleting volumes:

```bash
RUNTIME_POSTGRES_PORT="5432" \
RUNTIME_WEB_URL="http://127.0.0.1:3000/login" \
RUNTIME_RUN_SEED=true \
npm run runtime:smoke
```

`runtime:smoke` waits for PostgreSQL, runs `prisma migrate deploy`, optionally
runs seed, runs PostgreSQL/search-extension readiness checks, and performs an
HTTP smoke against the web URL. It does not start, stop, reset, or remove
containers, volumes, uploads, model cache, or database state.

## Optional Embedding Sidecar

Start the embedding sidecar only when you intentionally want the local CPU model
path. The first run may download a large model into
`reqflow-embedding-model-cache`.

```bash
AUTH_SECRET="replace-with-a-local-secret" docker compose -f docker-compose.runtime.yml --profile embedding up -d --build
```

Probe it from the host:

```bash
LOCAL_EMBEDDING_BASE_URL="http://127.0.0.1:8081" \
LOCAL_EMBEDDING_PATH="/embed" \
LOCAL_EMBEDDING_REQUEST_FORMAT="tei" \
LOCAL_EMBEDDING_MODEL="intfloat/multilingual-e5-large" \
LOCAL_EMBEDDING_DIMENSIONS="1024" \
npm run embedding:probe
```

When the sidecar is running, the runtime smoke can include the probe:

```bash
RUNTIME_PROBE_EMBEDDING=true npm run runtime:smoke
```

## Volumes

| Volume | Contents | Cleanup policy |
| --- | --- | --- |
| `reqflow-postgres-data` | PostgreSQL data directory | Do not delete from bundle commands. |
| `reqflow-uploads` | Web upload directory mounted at `/app/public/uploads` | Do not delete from bundle commands. |
| `reqflow-embedding-model-cache` | Optional sidecar model cache | Do not delete from bundle commands. |

Cleanup is intentionally not automated. Any volume/model-cache deletion requires
an explicit operator decision.

## Boundaries

- The web service waits for PostgreSQL health but does not run migrations or seed.
- The optional embedding service is profile-gated and not started by the default
  `postgres web` command.
- PostgreSQL native FTS remains the active lexical fallback. This bundle does not
  prove BM25 or enable `pg_search`.
- The web image does not contain embedding model weights.
- This file does not change production secret handling or deployment readiness.
