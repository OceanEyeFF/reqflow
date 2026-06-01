# Gate Evidence: WT-20260601-113

## Metadata

- worktrack_id: WT-20260601-113
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `docs/ms13-final-validation.md` records the final MS-13 validation and CodeReview handback report.
- `.servo/worktrack/WT-20260601-113/contract.md` and `plan-task-queue.md` define the review scope, baseline, and validation requirements.
- No runtime code changes were required in WT-113 after WT-112 repaired the Docker build fallback.

## Review Evidence

- performance: pass. Web image remains model-agnostic and standalone; Docker build uses Webpack fallback for Linux container reliability. Residual build-cache optimization is non-blocking.
- architecture: pass. Default compose path is `postgres web`; optional embedding sidecar is profile-gated; migrations/seed/readiness are explicit operator actions; BM25 remains deferred.
- security: pass. `.dockerignore` excludes secrets/local state; `AUTH_SECRET` is required; provider secrets are runtime env only; web runs as non-root; smoke redacts DB password.
- quality: pass. README, handoff, runtime contracts, BM25 feasibility, and runbook align on current MS-13 facts and boundaries.
- tests: pass. Lint, test, host builds, compose config, Docker build/up, and runtime smoke passed after worktree dependencies were installed.

## Validation Evidence

- `npm ci`: pass in WT-113 worktree.
- `npx prisma generate --schema prisma/schema.prisma`: pass.
- First `npm run test` and first `npm run build` failed because the new WT-113 worktree did not yet have `node_modules`; after `npm ci` and Prisma generate, they passed.
- `npm run lint`: pass.
- `npm run test`: pass, 33 test files / 257 tests.
- `npm run build`: pass with Next.js 16.2.6 Turbopack.
- `npm run build:webpack`: pass.
- `docker compose -f docker-compose.runtime.yml config` with `AUTH_SECRET=replace-with-a-local-secret`: pass.
- `docker compose -f docker-compose.runtime.yml --profile embedding config` with `AUTH_SECRET=replace-with-a-local-secret`: pass.
- `docker compose -f docker-compose.runtime.yml up -d --build postgres web` with `POSTGRES_PORT=55433`, `REQFLOW_WEB_PORT=3301`, and `AUTH_SECRET=replace-with-a-local-secret`: pass.
- `RUNTIME_POSTGRES_PORT=55433 RUNTIME_WEB_URL=http://127.0.0.1:3301/login RUNTIME_RUN_SEED=true npm run runtime:smoke`: pass.
- Runtime smoke evidence: PostgreSQL TCP ready; 9 migrations applied; seed created local users/sample ticket/comment; Prisma validate pass; migrate status up to date; PostgreSQL 16.14; `vector` 0.8.2 available/installed; pgvector readiness pass; native PostgreSQL FTS readiness pass; BM25 candidates unavailable boundary recorded; `pg_search` unavailable boundary recorded; web HTTP smoke 200; optional embedding probe skipped by default.
- `docker compose -f docker-compose.runtime.yml stop web postgres`: pass; no volume/cache deletion.

## Policy Evidence

- Worktree discipline: WT-113 ran in `.worktrees/wt-20260601-113-runtime-final-validation`.
- No destructive cleanup was run. Validation used `docker compose stop`; no `down -v`, `volume rm`, prune, upload deletion, model-cache deletion, or database reset was used.
- Policy scans found no active claim that BM25 is enabled, `pg_search` is active, native FTS is BM25, local embedding sidecar is a default production path, or the web image contains model weights.
- The Dockerfile's `rm -rf /var/lib/apt/lists/*` is limited to image-layer package-list cleanup, not runtime data or host cleanup.
- `docker run --rm` appears only in documentation for an ephemeral standalone web container run, not as a volume/cache deletion path.
- Final acceptance remains fdch0-only.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
