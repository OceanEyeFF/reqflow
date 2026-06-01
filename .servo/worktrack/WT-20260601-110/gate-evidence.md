# Gate Evidence: WT-20260601-110

## Metadata

- worktrack_id: WT-20260601-110
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `scripts/runtime-bundle-smoke.mjs` adds a safe operator-triggered smoke command.
- `package.json` adds `runtime:smoke`.
- `docs/docker-compose-runtime-bundle.md` documents the runtime smoke command, optional seed, optional embedding probe, and non-destructive boundaries.
- The script derives a local PostgreSQL URL from runtime env defaults, redacts the password in logs, waits for PostgreSQL, runs migrations, optionally runs seed, runs PostgreSQL/search readiness checks, performs web HTTP smoke, and optionally runs the embedding probe.
- The script does not start, stop, reset, remove, prune, or delete containers, volumes, uploads, model cache, or database state.

## Validation Evidence

- `npm ci`: pass in WT-110 worktree.
- `git diff --check`: pass.
- Destructive command scan over `scripts/runtime-bundle-smoke.mjs`, docs, package script, and WT-110 artifacts found no cleanup behavior; only policy text states that volumes must not be deleted.
- Compose runtime was started manually for validation on alternate local ports with `POSTGRES_PORT=55432` and `REQFLOW_WEB_PORT=3300`; it was stopped with `docker compose stop web postgres` after smoke, with no volume deletion.
- `RUNTIME_POSTGRES_PORT=55432 RUNTIME_WEB_URL=http://127.0.0.1:3300/login RUNTIME_RUN_SEED=false npm run runtime:smoke`: pass.
- Runtime smoke evidence: PostgreSQL TCP ready; `prisma migrate deploy` applied 9 migrations; seed skipped by default; Prisma validate pass; migrate status up to date; PostgreSQL 16.14; pgvector readiness pass; native PostgreSQL FTS readiness pass; `pg_search` unavailable boundary recorded; web HTTP smoke returned status 200; embedding probe skipped by default.
- `npm run build`: pass.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-110-runtime-orchestration`.
- Scope boundary: no container lifecycle automation, no volume/cache deletion, no production deployment, no BM25 runtime claim.
- Seed is opt-in through `RUNTIME_RUN_SEED=true`; embedding probe is opt-in through `RUNTIME_PROBE_EMBEDDING=true`.
- The `pg_search` result remains an unavailable boundary with native PostgreSQL FTS fallback, not a BM25 enablement claim.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
