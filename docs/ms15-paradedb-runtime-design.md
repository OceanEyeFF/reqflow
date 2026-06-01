# MS-15 ParadeDB Runtime Candidate Design

## Metadata

- milestone: MS-15
- worktrack: WT-20260601-123
- updated: 2026-06-01
- status: runtime candidate design

## Purpose

This document records the first MS-15 runtime replacement design for testing
ParadeDB `pg_search` as a ReqFlow PostgreSQL runtime candidate.

The design is intentionally isolated. It does not change
`docker-compose.runtime.yml`, does not use the accepted MS-13 PostgreSQL volume,
and does not enable BM25 in the default runtime.

## Candidate Compose File

WT-123 adds:

- `docker-compose.paradedb.yml`

The file is a standalone candidate compose path with:

- `postgres`: ParadeDB PostgreSQL candidate image;
- `web`: the existing ReqFlow web image build;
- `reqflow-paradedb-postgres18-data`: separate candidate database volume;
- `reqflow-paradedb-uploads`: separate candidate upload volume.

Because the current ParadeDB image is PostgreSQL 18 based, the database volume
is mounted at `/var/lib/postgresql`, not `/var/lib/postgresql/data`. PostgreSQL
18 Docker images create major-version-specific data directories under that
mount, and mounting directly at `/var/lib/postgresql/data` makes startup fail
with an unused-mount/upgrade-layout error.

It does not reuse:

- `reqflow-paradedb-postgres-data`, the superseded WT-123 pre-smoke candidate
  volume name that mounted at the PostgreSQL 16-era data path;
- `reqflow-postgres-data`;
- `reqflow-uploads`;
- `reqflow-embedding-model-cache`.

## Image Identity

Observed current upstream image metadata from `docker buildx imagetools inspect
paradedb/paradedb:latest`:

| Item | Value |
| --- | --- |
| index digest | `sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d` |
| linux/amd64 manifest | `sha256:dab9ab4a3d7a17c0348d9d5c48231c7a11a91879c4cb45b8de994558dd60f13e` |
| linux/arm64 manifest | `sha256:3ac93ed9c455bbab6790e4f12ffaa0805907303c9dc208832609359d53803a51` |

The candidate compose default uses the index digest:

```text
paradedb/paradedb@sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d
```

It also sets:

```text
PARADEDB_PLATFORM=linux/amd64
```

by default through Compose interpolation. Operators can override both:

```powershell
$env:PARADEDB_IMAGE = "paradedb/paradedb@sha256:<approved-digest>"
$env:PARADEDB_PLATFORM = "linux/arm64"
```

## Pinning Caveat

MS-14 tested `paradedb/paradedb:latest`. `latest` is not stable enough for a
runtime replacement decision. The digest above makes this WT-123 candidate path
repeatable for the currently observed image, but it is still not a long-term
release policy.

WT-124/WT-125 should record the actual runtime facts from the digest-pinned
candidate before any enablement recommendation:

- PostgreSQL version;
- `pg_search` extension version;
- `vector` extension version;
- `pg_available_extensions` result;
- `CREATE EXTENSION` result;
- migration and query behavior.

If this digest disappears or does not match the operator platform, MS-15 should
record that as a pinning blocker and avoid default runtime switch proposals.

## Operator Commands

Validate candidate compose shape without starting containers:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
docker compose -f docker-compose.paradedb.yml config
```

Start the candidate runtime on non-default local ports:

```powershell
$env:AUTH_SECRET = "replace-with-a-local-secret"
$env:POSTGRES_PORT = "55437"
$env:REQFLOW_WEB_PORT = "3307"
docker compose -f docker-compose.paradedb.yml up -d --build postgres web
```

Run the existing runtime smoke against the candidate runtime:

```powershell
$env:RUNTIME_POSTGRES_PORT = "55437"
$env:RUNTIME_WEB_URL = "http://127.0.0.1:3307/login"
$env:RUNTIME_RUN_SEED = "true"
npm run runtime:smoke
```

Run strict `pg_search` readiness after the candidate database is up:

```powershell
$env:SEARCH_REQUIRE_PG_SEARCH = "true"
$env:SEARCH_EXTENSION_DATABASE_URL = "postgresql://reqflow:reqflow@127.0.0.1:55437/reqflow_dev?schema=public"
npm run search:extensions
```

Stop without deleting candidate state:

```powershell
docker compose -f docker-compose.paradedb.yml stop web postgres
```

## Safety Boundaries

Allowed:

- `docker compose -f docker-compose.paradedb.yml config`;
- `docker compose -f docker-compose.paradedb.yml up -d --build postgres web`;
- `npm run runtime:smoke` pointed at the candidate ports;
- `npm run search:extensions` pointed at the candidate database URL;
- `docker compose -f docker-compose.paradedb.yml stop web postgres`.

Not allowed without explicit fdch0 approval:

- editing `docker-compose.runtime.yml` to replace the default database image;
- using `down -v`, `volume rm`, `system prune`, or manual cache deletion;
- mounting `reqflow-postgres-data` into ParadeDB;
- migrating existing local/production volumes;
- claiming BM25 is active in the default runtime.

## WT-124 Handoff

WT-124 should use this candidate compose file to validate:

- `docker compose -f docker-compose.paradedb.yml config`;
- candidate startup on alternate ports;
- Prisma validate and migrate deploy;
- optional seed;
- PostgreSQL readiness;
- search extension readiness with `SEARCH_REQUIRE_PG_SEARCH=true`;
- web HTTP smoke;
- no mutation of MS-13 default volumes.

WT-124 may update this design only if actual startup evidence shows that the
candidate compose needs a non-destructive compatibility adjustment.
