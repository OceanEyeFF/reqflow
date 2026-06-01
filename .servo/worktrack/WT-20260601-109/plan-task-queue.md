# Plan Task Queue: WT-20260601-109

## Queue Status

- status: active
- current_next_action: validate compose runtime bundle

## Tasks

1. Add compose runtime bundle.
   - status: completed
   - evidence: `docker-compose.runtime.yml`
2. Gate embedding sidecar behind an explicit Compose profile.
   - status: completed
   - evidence: `docker-compose.runtime.yml`
3. Document runtime bundle usage and volume boundaries.
   - status: completed
   - evidence: `docs/docker-compose-runtime-bundle.md`
4. Run validation gates.
   - status: completed
   - commands: `docker compose -f docker-compose.runtime.yml config`; `docker compose -f docker-compose.runtime.yml --profile embedding config`; `docker compose -f docker-compose.runtime.yml build web`; compose startup smoke with `POSTGRES_PORT=55432` and `REQFLOW_WEB_PORT=3300`.
