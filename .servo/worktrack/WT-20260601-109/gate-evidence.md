# Gate Evidence: WT-20260601-109

## Metadata

- worktrack_id: WT-20260601-109
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `docker-compose.runtime.yml` adds a local runtime bundle with `postgres`, `web`, and profile-gated `embedding` services.
- `postgres` uses `pgvector/pgvector:0.8.2-pg16`, local env defaults, a healthcheck, and named volume `reqflow-postgres-data`.
- `web` builds `Dockerfile`, waits for healthy `postgres`, uses Compose-network `DATABASE_URL`, mounts uploads to named volume `reqflow-uploads`, and keeps provider secrets as runtime environment variables.
- `embedding` uses `profiles: [embedding]`, `ghcr.io/huggingface/text-embeddings-inference:cpu-1.9`, and named volume `reqflow-embedding-model-cache`; it is absent from default config unless `--profile embedding` is used.
- `docs/docker-compose-runtime-bundle.md` documents default startup, optional sidecar startup, separate migration/seed operator steps, and volume cleanup boundaries.

## Validation Evidence

- `AUTH_SECRET=wt109-local-config-secret docker compose -f docker-compose.runtime.yml config`: pass. Default rendered services are `postgres` and `web`; `embedding` is absent.
- `AUTH_SECRET=wt109-local-config-secret docker compose -f docker-compose.runtime.yml --profile embedding config`: pass. Rendered config includes `embedding`, TEI CPU image, port `8081`, and `reqflow-embedding-model-cache`.
- `AUTH_SECRET=wt109-local-config-secret docker compose -f docker-compose.runtime.yml build web`: pass.
- Destructive command scan over `docker-compose.runtime.yml`, `docs/docker-compose-runtime-bundle.md`, and WT-109 artifacts found no `down -v`, `volume rm`, `docker system prune`, `rm -rf`, or equivalent cleanup command; only policy text says volumes must not be deleted.
- Initial startup smoke on default ports was blocked by host port `5432` already allocated.
- Retry startup smoke with `POSTGRES_PORT=55432` and `REQFLOW_WEB_PORT=3300`: pass. `postgres` became healthy, `web` started, and logs printed Next.js `Ready`. The smoke used `docker compose stop web postgres`, not volume deletion.
- `git diff --check`: pass.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-109-compose-runtime-bundle`.
- Scope boundary: no migration/seed automation, production deployment, BM25 runtime claim, default embedding enablement, or destructive volume/cache action.
- The bundle keeps migrations and seed as separate operator steps, preserving WT-109 scope and leaving orchestration to WT-110.
- The optional embedding sidecar is profile-gated and may download model cache only when explicitly started with `--profile embedding`.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
