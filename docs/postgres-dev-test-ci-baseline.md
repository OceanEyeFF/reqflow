# PostgreSQL Dev/Test/CI Baseline

## Metadata

- worktrack: WT-20260529-079
- milestone: MS-9
- updated: 2026-05-31

## Purpose

This document established the WT-079 PostgreSQL service/readiness baseline. WT-080 has now converted that service boundary into the active Prisma PostgreSQL provider boundary.

## Current Boundary

- `prisma/schema.prisma` now uses `provider = "postgresql"`.
- CI runs the product lint/test/build baseline against a PostgreSQL service.
- `npm run postgres:readiness` now requires a PostgreSQL provider and runs PostgreSQL `prisma validate` + `prisma migrate status`.

## Local PostgreSQL Service

Start the local PostgreSQL service:

```bash
docker compose -f docker-compose.postgres.yml up -d postgres
```

Default local URL:

```bash
POSTGRES_DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public"
```

Wait for the TCP endpoint:

```bash
npm run postgres:wait
```

Run readiness checks:

```bash
npm run postgres:readiness
```

Apply migrations before readiness status checks on a fresh database:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

## CI Baseline

The GitHub Actions workflow defines a PostgreSQL-backed baseline job and a `postgres-readiness` job. These jobs:

- installs dependencies,
- waits for PostgreSQL,
- deploys Prisma migrations where needed,
- runs the provider-aware `npm run postgres:readiness` boundary check.

The baseline job uses PostgreSQL for Prisma generate, tests, build database preparation, and build.

## WT-080 Handoff

WT-080 converted this baseline into the actual Prisma PostgreSQL provider migration:

- Prisma provider and migration lock are PostgreSQL.
- Test helpers use isolated PostgreSQL schemas.
- CI lint/test/build uses PostgreSQL.
- Rollback/restore notes live in `docs/prisma-postgres-provider-boundary.md`.

## Non-Goals

- No pgvector or BM25/FTS extension enablement in WT-079/WT-080.
- No production database migration execution in WT-079/WT-080.
- No pgvector or BM25/FTS extension enablement in WT-079.
- No production database migration in WT-079.
