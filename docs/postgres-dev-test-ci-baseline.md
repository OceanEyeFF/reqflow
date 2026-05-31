# PostgreSQL Dev/Test/CI Baseline

## Metadata

- worktrack: WT-20260529-079
- milestone: MS-9
- updated: 2026-05-31

## Purpose

This document establishes the reproducible PostgreSQL dev/test/CI baseline for the hybrid search milestone. It prepares a PostgreSQL service, readiness scripts, and CI wiring without changing the current Prisma datasource provider. The provider migration remains WT-20260529-080.

## Current Boundary

- Current `prisma/schema.prisma` still uses `provider = "sqlite"`.
- Current CI still runs the product build and test suite with SQLite (`DATABASE_URL=file:./ci.db`) until WT-080 changes the Prisma provider boundary.
- WT-079 adds a PostgreSQL service readiness lane so later worktracks can verify that PostgreSQL is available before migration and extension readiness work starts.
- `npm run postgres:readiness` is provider-aware. Before WT-080, it confirms PostgreSQL service availability and validates the current SQLite provider with a SQLite-compatible CI URL. After WT-080 changes the provider to PostgreSQL, it becomes a full PostgreSQL `prisma validate` + `prisma migrate status` gate.

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

Before WT-080, only endpoint readiness and current-provider `prisma validate` are expected to be useful because `prisma/schema.prisma` still declares SQLite. `prisma migrate status` against PostgreSQL becomes a passing gate after the PostgreSQL provider migration is implemented.

## CI Baseline

The GitHub Actions workflow now defines a `postgres-readiness` job with a PostgreSQL 16 service. This job:

- installs dependencies,
- waits for PostgreSQL,
- runs the provider-aware `npm run postgres:readiness` boundary check.

Before WT-080, this confirms PostgreSQL service availability without breaking the existing SQLite runtime path. After WT-080 switches the Prisma provider to PostgreSQL, the same script runs `prisma validate` and `prisma migrate status` against `POSTGRES_DATABASE_URL`.

The existing `baseline` job remains unchanged for lint/test/build so this worktrack does not break the current SQLite runtime path.

## WT-080 Handoff

WT-080 must convert this baseline into the actual Prisma PostgreSQL provider migration. It must:

- change Prisma provider and migrations deliberately,
- make `npm run postgres:readiness` pass fully,
- decide whether test helpers keep SQLite temporarily or move to isolated PostgreSQL schemas/databases,
- define rollback/restore notes for existing SQLite dev data,
- update CI so lint/test/build run against the correct target database.

## Non-Goals

- No Prisma provider switch in WT-079.
- No schema or migration rewrite in WT-079.
- No pgvector or BM25/FTS extension enablement in WT-079.
- No production database migration in WT-079.
