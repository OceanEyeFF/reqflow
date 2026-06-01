# MS-13 Final Validation

## Metadata

- milestone: MS-13
- title: Docker Compose Runtime Bundle 与本地一键运行
- worktrack: WT-20260601-113
- updated: 2026-06-01
- status: ready for fdch0 acceptance review

## Scope Reviewed

- `Dockerfile`
- `.dockerignore`
- `docker-compose.runtime.yml`
- `scripts/runtime-bundle-smoke.mjs`
- `package.json`
- `README.md`
- `docs/docker-web-runtime-env.md`
- `docs/docker-compose-runtime-bundle.md`
- `docs/ms13-runtime-operator-runbook.md`
- `docs/ms13-bm25-runtime-feasibility.md`
- `docs/search-extension-readiness.md`
- MS-13 worktrack evidence under `.servo/worktrack/WT-20260601-108` through
  `.servo/worktrack/WT-20260601-113`

## Final Verdict

MS-13 is implementation-ready for fdch0 acceptance handback.

The default runtime bundle starts PostgreSQL/pgvector and the web container,
runs explicit migrate/seed/readiness/web smoke from the host, keeps embedding
as an optional profile-gated sidecar, and preserves native PostgreSQL FTS
fallback because no BM25 extension candidate is packaged in the selected image.

Final acceptance remains fdch0-only.

## Validation Commands

| Command | Result |
| --- | --- |
| `npm ci` | pass in WT-113 worktree |
| `npx prisma generate --schema prisma/schema.prisma` | pass |
| `npm run lint` | pass |
| `npm run test` | pass, 33 files / 257 tests |
| `npm run build` | pass with Next.js 16.2.6 Turbopack after worktree dependencies were installed |
| `npm run build:webpack` | pass |
| `docker compose -f docker-compose.runtime.yml config` | pass with `AUTH_SECRET=replace-with-a-local-secret` |
| `docker compose -f docker-compose.runtime.yml --profile embedding config` | pass |
| `docker compose -f docker-compose.runtime.yml up -d --build postgres web` | pass on alternate ports `POSTGRES_PORT=55433`, `REQFLOW_WEB_PORT=3301` |
| `npm run runtime:smoke` | pass with `RUNTIME_POSTGRES_PORT=55433`, `RUNTIME_WEB_URL=http://127.0.0.1:3301/login`, `RUNTIME_RUN_SEED=true` |
| `docker compose -f docker-compose.runtime.yml stop web postgres` | pass; no volume/cache deletion |

Runtime smoke evidence:

- PostgreSQL TCP endpoint ready on `127.0.0.1:55433`.
- `prisma migrate deploy` applied 9 migrations to a fresh runtime volume.
- Seed created admin/manager/user and sample ticket/comment.
- Prisma schema validation passed.
- Prisma migration status was up to date.
- PostgreSQL server version was 16.14.
- `vector` 0.8.2 was available and installed.
- pgvector readiness passed.
- native PostgreSQL FTS readiness passed.
- BM25 extension candidates were unavailable in the current image, so native
  PostgreSQL FTS fallback remained required.
- `pg_search` was unavailable in the current image.
- Web HTTP smoke returned status 200 for `/login`.
- Optional embedding probe was skipped by default.

## CodeReview

### Performance

- Docker image remains model-agnostic; embedding model downloads stay in the
  optional sidecar volume instead of the web image.
- Next standalone output is copied into the runner image; the runtime image does
  not carry the full build tree.
- Container build uses `npm run build:webpack` to avoid the Next 16
  Turbopack native-binding failure observed in Linux Docker build.
- Residual risk: the web image still performs a full `npm ci` during Docker
  build and does not use BuildKit cache mounts. This is acceptable for MS-13
  local runtime packaging but can be optimized later.

### Architecture

- `docker-compose.runtime.yml` has a clear default path: `postgres` + `web`.
- The `embedding` service is behind the `embedding` profile.
- Migrate/seed/readiness remains an explicit host/operator action through
  `npm run runtime:smoke`; web startup does not mutate schema or seed data.
- `AUTH_SECRET` is required at Compose config/start time.
- BM25 is explicitly deferred to a future target runtime; default runtime stays
  on `pgvector/pgvector:0.8.2-pg16` plus native FTS fallback.

### Security

- `.dockerignore` excludes `.env*`, `.servo`, worktrees, local tool state,
  logs, local DBs, generated Prisma outputs, screenshots, and zip artifacts
  from the Docker build context.
- Provider secrets are runtime environment variables, not Docker build args.
- Web container runs as non-root `nextjs`.
- Runtime smoke redacts the database password in logs.
- No production secret, backup/restore, or cloud deployment policy is changed.

### Quality

- Operator docs now cover quick path, alternate ports, config validation,
  migrate, seed, smoke, logs, stop behavior, optional sidecar probe, search
  boundary, and troubleshooting.
- `README.md` and `docs/handoff.md` point to the MS-13 runtime entrypoint and
  no longer describe MS-11 as current.
- Search/BM25 docs consistently distinguish native FTS fallback from BM25.

### Tests

- Unit/integration test suite passed after installing worktree-local
  dependencies and generating Prisma Client.
- Host Turbopack build passed.
- Host Webpack build passed.
- Docker image build passed and exercised the same `build:webpack` path used
  in the Dockerfile.
- Runtime smoke passed against the built image and Compose PostgreSQL.

## Policy Review

- No command silently deletes Docker volumes, upload storage, model cache, or
  database state.
- Validation used `docker compose stop`, not `down -v`, `volume rm`, or prune.
- The web image does not contain embedding model weights.
- The optional sidecar remains non-default.
- No doc claims BM25 is enabled in the default runtime bundle.
- No doc claims production readiness; production deployment, secrets,
  backup/restore, and production migration remain separate approval boundaries.

## Known Boundaries

1. `npm audit` during Docker build reports 3 moderate vulnerabilities. This was
   observed during image build but is not newly introduced by MS-13; dependency
   remediation should be handled in a separate security/dependency worktrack.
2. Optional embedding sidecar config is validated through Compose config and
   prior WT-100/WT-112 probe evidence, but WT-113 did not start the sidecar or
   download model weights by default.
3. BM25 enablement remains future work requiring a target PostgreSQL runtime
   with a supported extension and separate query/index validation.
4. Runtime volumes created during smoke were intentionally stopped but not
   deleted.

## Acceptance Handback

MS-13 can be handed back to fdch0 for final acceptance decision.

Recommended acceptance basis:

- Docker runtime path starts web + PostgreSQL/pgvector.
- Runtime smoke validates migrate, seed, PostgreSQL readiness, search readiness,
  and web HTTP 200.
- Operator runbook documents start, stop, logs, readiness, optional embedding
  probe, cache/volume boundaries, and troubleshooting.
- BM25 and production deployment boundaries remain explicit.
