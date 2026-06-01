# Gate Evidence: WT-20260601-112

## Metadata

- worktrack_id: WT-20260601-112
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `docs/ms13-runtime-operator-runbook.md` adds the MS-13 runtime operator path covering quick start, alternate ports, compose config validation, migrate, seed, smoke, logs, stop behavior, optional embedding sidecar probing, search runtime boundary, and troubleshooting.
- `docs/docker-compose-runtime-bundle.md` now points to the operator runbook, documents alternate-port smoke wiring, and records the standard non-destructive stop command.
- `README.md` now exposes the Docker runtime bundle command and `npm run runtime:smoke` entry.
- `docs/handoff.md` is refreshed from stale MS-11 status to MS-13 runtime bundle facts and remaining work.
- `Dockerfile` now uses `npm run build:webpack` in the container builder stage.
- `package.json` adds `build:webpack` for Docker/Linux fallback builds while leaving host `npm run build` on the Next 16 default Turbopack path.
- `docs/docker-web-runtime-env.md` documents the container build command and why Docker uses Webpack.

## Validation Evidence

- `npm ci`: pass in WT-112 worktree; Windows cleanup emitted a non-fatal EPERM warning for an old nested dependency directory.
- `npx prisma generate --schema prisma/schema.prisma`: pass.
- `docker compose -f docker-compose.runtime.yml config` with `AUTH_SECRET=replace-with-a-local-secret`: pass.
- `docker compose -f docker-compose.runtime.yml --profile embedding config` with `AUTH_SECRET=replace-with-a-local-secret`: pass.
- `git diff --check`: pass; line-ending warnings only.
- Stale/false-claim doc scans found no active claim that BM25 is enabled, `pg_search` is active, native FTS is BM25, or the local embedding sidecar is still unimplemented.
- `npm run build`: pass with Next.js 16.2.6 Turbopack on host.
- `npm run build:webpack`: pass with Next.js 16.2.6 webpack on host.
- Initial `docker compose up -d --build postgres web` exposed a real Linux container build blocker: Next 16 Turbopack could not run with only WASM bindings. This was fixed by using `npm run build:webpack` in `Dockerfile`.
- `docker compose -f docker-compose.runtime.yml up -d --build postgres web` with `POSTGRES_PORT=55432`, `REQFLOW_WEB_PORT=3300`, and `AUTH_SECRET=replace-with-a-local-secret`: pass after the Docker build fallback repair; `reqflow-web:local` image created and services started.
- `RUNTIME_POSTGRES_PORT=55432 RUNTIME_WEB_URL=http://127.0.0.1:3300/login RUNTIME_RUN_SEED=true npm run runtime:smoke`: pass.
- Runtime smoke evidence: PostgreSQL TCP ready; `prisma migrate deploy` applied 9 migrations to a fresh runtime volume; seed created admin/manager/user and sample ticket/comment; Prisma validate pass; migrate status up to date; PostgreSQL 16.14; pgvector readiness pass; native PostgreSQL FTS readiness pass; BM25 candidates unavailable boundary recorded; `pg_search` unavailable boundary recorded; web HTTP smoke returned 200; embedding probe skipped by default.
- `docker compose -f docker-compose.runtime.yml stop web postgres`: pass; no volume/cache deletion.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-112-runtime-runbook`.
- Scope boundary: no production deployment, no secret policy change, no BM25 enablement, no embedding sidecar defaulting, no runtime lifecycle automation beyond existing operator-run commands.
- Destructive boundary: validation stopped containers with `docker compose stop`; no `down -v`, `volume rm`, cache deletion, upload deletion, or database reset was used.
- Next.js docs checked locally under `node_modules/next/dist/docs/`: Next 16 uses Turbopack by default; Turbopack requires platform-specific native bindings; when only WASM bindings are available, use `next build --webpack`.
- Current runtime remains native PostgreSQL FTS fallback plus pgvector. BM25 remains target-runtime research only.
- The web image still does not contain embedding model weights.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
