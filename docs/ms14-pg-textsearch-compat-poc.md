# MS-14 pg_textsearch Runtime Compatibility PoC

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-119
- updated: 2026-06-01
- status: compatibility PoC completed; candidate deferred

## Scope

This PoC checked whether `pg_textsearch` has a ready-to-run local runtime path
compatible with MS-14 evaluation. It did not build a custom PostgreSQL image,
install OS packages into an existing container, modify `docker-compose.runtime.yml`,
or touch persistent volumes.

## Command

```bash
npm run pg-textsearch:poc
```

Default isolated settings:

- image: `postgres:18`
- host port: `127.0.0.1:55441`
- host data volume: none
- cleanup: temporary container is removed unless `PG_TEXTSEARCH_KEEP_CONTAINER=true`

## Runtime Facts

Observed from `docs/ms14-pg-textsearch-compat-results.json`:

- PostgreSQL: `18.4 (Debian 18.4-1.pgdg13+1)`
- `shared_preload_libraries`: empty
- `pg_textsearch` in `pg_available_extensions`: no
- `CREATE EXTENSION pg_textsearch`: not attempted because the extension is not available

## Decision

WT-119 result: `defer`.

Reason:

- `pg_textsearch` is not present in the tested PostgreSQL 18 runtime image.
- Upstream package usage would require a custom image/package installation path
  and likely `shared_preload_libraries = 'pg_textsearch'`.
- Building and hardening such an image is outside WT-119 and would need a
  separate enablement worktrack before benchmark comparison.

## Impact On MS-14

`pg_textsearch` remains a candidate family, but not a runnable local candidate
for the current MS-14 PoC lane. WT-121 should compare measured results from
ParadeDB and VectorChord plus native/hybrid baselines; `pg_textsearch` should
be represented as deferred due to packaging/runtime availability unless a
separate custom image path is approved.

## Non-Claims

- `pg_textsearch` is not enabled in ReqFlow.
- PostgreSQL native FTS is still not BM25.
- This PoC does not justify replacing the MS-13 runtime image.
- No default runtime, volume, upload, model cache, or database state was changed.
