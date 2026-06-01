# Plan Task Queue: WT-20260601-124

## Queue Status

- status: active
- current_next_action: run ParadeDB candidate runtime smoke and readiness validation

## Tasks

1. Create WT-124 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-124/contract.md`, `.servo/worktrack/WT-20260601-124/plan-task-queue.md`.
2. Validate candidate compose config.
   - status: completed
   - command: `docker compose -f docker-compose.paradedb.yml config`.
3. Start candidate runtime services on alternate ports.
   - status: completed
   - command: `docker compose -f docker-compose.paradedb.yml up -d --build postgres web`.
4. Run Prisma/seed/readiness/web smoke against the candidate runtime.
   - status: completed
   - command: `npm run runtime:smoke` with `RUNTIME_POSTGRES_PORT=55437`, `RUNTIME_WEB_URL=http://127.0.0.1:3307/login`, and `RUNTIME_RUN_SEED=true`.
5. Run strict search extension readiness and capture version facts.
   - status: completed
   - command: `npm run search:extensions` with `SEARCH_REQUIRE_PG_SEARCH=true`.
6. Stop candidate services without deleting volumes.
   - status: completed
   - command: `docker compose -f docker-compose.paradedb.yml stop web postgres`.
7. Run policy checks and record gate evidence.
   - status: completed
   - commands: `git diff --check`, targeted non-claim/destructive scan.
