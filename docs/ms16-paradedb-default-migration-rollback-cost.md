# MS-16 ParadeDB Default Runtime Migration And Rollback Cost

## Metadata

- milestone: MS-16
- worktrack: WT-20260601-129
- updated: 2026-06-02
- status: migration and rollback cost estimate

## Purpose

This report estimates the impact of moving ReqFlow's default PostgreSQL runtime
from the accepted MS-13 runtime to the MS-15 ParadeDB candidate runtime.

It is a planning artifact. It does not switch `docker-compose.runtime.yml`, does
not migrate any existing local or production data, and does not delete Docker
volumes, uploads, model cache, or database state.

## Baseline Runtime Delta

| Area | Current default | ParadeDB candidate | Migration implication |
| --- | --- | --- | --- |
| Compose entrypoint | `docker-compose.runtime.yml` | `docker-compose.paradedb.yml` | A later implementation must either update the default compose file or create a clearly selected default profile. |
| PostgreSQL image | `pgvector/pgvector:0.8.2-pg16` | digest-pinned `paradedb/paradedb@sha256:c3ef...201da2d` | Runtime distribution and PostgreSQL major version change. |
| PostgreSQL version | `16.14` observed in MS-13 | `18.4` observed in MS-15 | Existing data directory cannot be mounted as-is across the major-version/runtime boundary. |
| DB volume target | `/var/lib/postgresql/data` | `/var/lib/postgresql` | PostgreSQL 18 image layout differs; the MS-15 design explicitly found the old data path fails startup. |
| Default DB volume | `reqflow-postgres-data` | `reqflow-paradedb-postgres18-data` | A default switch must define whether to create fresh data, dump/restore, or keep old data isolated. |
| Upload volume | `reqflow-uploads` | `reqflow-paradedb-uploads` | Upload persistence and local inspection behavior must be deliberately mapped if switching default compose. |
| Search extensions | `vector` available; native FTS fallback active; `pg_search` unavailable | `pg_search` 0.23.5 and `vector` 0.8.1 available | Default readiness gates must become strict for `pg_search` only after implementation approval. |
| App behavior | app lexical lane not wired to ParadeDB | runtime supports `pg_search` but app code unchanged | Runtime switch alone does not make product BM25-active. |

## Migration Options

### Option A: Fresh Pre-Production Default Data

Description: when ParadeDB becomes the default, start with a fresh ParadeDB
volume and rerun Prisma migrations and seed. Keep the MS-13 volume untouched as
rollback evidence.

Cost estimate:

- Engineering: low to medium.
- Validation: medium.
- Data migration: low.
- Rollback: low.
- Operator risk: low.

Best fit:

- Local/pre-production environments where preserving current local test data is
  not essential.
- Fastest path to align default runtime with ParadeDB while avoiding unsafe
  cross-major-version volume reuse.

Required gates:

- `docker compose -f <future default compose> config`.
- `npx prisma migrate deploy --schema prisma/schema.prisma`.
- `npm run db:seed` or `npm run runtime:smoke` with seed enabled.
- `SEARCH_REQUIRE_PG_SEARCH=true npm run search:extensions` against the new
  default runtime.
- `npm run paradedb:candidate-benchmark` or successor default-runtime benchmark.
- `npm run retrieval:evaluate` after app integration exists.

### Option B: Logical Dump/Restore From MS-13

Description: export existing PostgreSQL 16 logical data and restore into the
ParadeDB/PostgreSQL 18 runtime, then run migrations and readiness checks.

Cost estimate:

- Engineering: medium.
- Validation: high.
- Data migration: medium to high.
- Rollback: medium.
- Operator risk: medium.

Best fit:

- Environments where current local/pre-production data matters enough to keep.
- Not required before fdch0 chooses a default runtime path, but needed before any
  production-like data migration claim.

Required gates:

- Explicit dump command and restore command documented in a future approved
  implementation worktrack.
- Restore into a separate ParadeDB volume, not the existing MS-13 volume.
- Row/count and key business surface checks after restore.
- Prisma `validate`, `migrate status`, and `migrate deploy`.
- App HTTP smoke and search readiness.
- Rollback test that stops the ParadeDB runtime and starts the untouched MS-13
  runtime.

### Option C: Direct Volume Reuse

Description: mount the existing MS-13 PostgreSQL 16 data volume directly into
ParadeDB/PostgreSQL 18.

Cost estimate:

- Engineering: deceptively low.
- Validation: very high.
- Data migration: unsafe.
- Rollback: high.
- Operator risk: high.

Decision:

- Reject for MS-16 planning. MS-15 already records that PostgreSQL 18 uses a
  different mount layout, and cross-major-version direct volume reuse is not a
  safe migration strategy.

## Rollback Model

Rollback must be non-destructive and must preserve the old default runtime until
the new default is accepted.

Minimum rollback path:

1. Stop the ParadeDB runtime with `docker compose ... stop web postgres`.
2. Start the MS-13 runtime with `docker compose -f docker-compose.runtime.yml up -d --build postgres web`.
3. Run `npm run runtime:smoke` against the MS-13 runtime.
4. Confirm native FTS fallback and pgvector readiness still pass.

Rollback costs:

| Cost area | Estimate | Notes |
| --- | --- | --- |
| Existing data preservation | low if old volume is untouched; high if any conversion is attempted | The recommended path keeps old volume isolated. |
| Operator procedure | medium | Two runtime paths and port/env handling must be clear. |
| App compatibility | medium | If app retrieval is later wired to ParadeDB-only SQL, fallback must either be preserved or rollback must include app config/code rollback. |
| Validation time | medium | Smoke and search readiness must run in both directions. |
| Production applicability | unknown | Production backup/restore remains outside MS-16 and needs a later production migration plan. |

## Cost Summary

| Dimension | Fresh default data | Logical dump/restore | Direct volume reuse |
| --- | ---: | ---: | ---: |
| Engineering cost | 2/5 | 3/5 | 2/5 nominal, 5/5 real risk |
| Validation cost | 3/5 | 4/5 | 5/5 |
| Migration cost | 2/5 | 4/5 | 5/5 |
| Rollback cost | 2/5 | 3/5 | 5/5 |
| Operator cost | 3/5 | 4/5 | 5/5 |
| Recommended | yes, for pre-production | maybe, when data preservation matters | no |

Lower numbers mean lower cost.

## Risk Register

| Risk | Severity | Pre-production treatment | Production treatment |
| --- | --- | --- | --- |
| PostgreSQL 16 to 18 runtime difference | medium | Acceptable with fresh volume and full smoke. | Requires formal backup/restore and rollback rehearsal. |
| Existing local volume incompatibility | high | Avoid by not mounting old volume. | Direct reuse remains blocked. |
| App retrieval not wired to `pg_search` | high for product claim | Runtime can switch only as infrastructure; no BM25 product claim until WT-130/future implementation. | Blocker for claiming default BM25 behavior. |
| Tokenizer evidence not final word-level proof | medium | Acceptable with current caveat if fdch0 chooses strategic switch. | Needs larger corpus and tokenizer policy. |
| Dual-runtime operator confusion | medium | Reduce by selecting one default and keeping rollback notes. | Requires production-grade runbooks. |
| ParadeDB image digest lifecycle | medium | Pin digest and record update process. | Needs release policy and security update plan. |

## Recommendation For MS-16 ADR

If fdch0 chooses ParadeDB as the future default, the lowest-risk implementation
shape is:

1. Use a fresh ParadeDB/PostgreSQL 18 default data volume for pre-production.
2. Keep the MS-13 default volume untouched until the new runtime passes gates.
3. Treat dump/restore as an optional later step only if preserving existing data
   becomes important.
4. Reject direct volume reuse.
5. Require a later implementation worktrack before editing `docker-compose.runtime.yml`.
6. Pair any default runtime switch with app retrieval validation before claiming
   BM25 active product behavior.

## Non-Claims

- This report does not switch the default runtime.
- This report does not approve production migration.
- This report does not delete or convert volumes.
- This report does not implement application retrieval changes.
- This report does not make fdch0's final runtime decision.
