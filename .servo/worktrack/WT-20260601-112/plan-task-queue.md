# Plan Task Queue: WT-20260601-112

## Queue Status

- status: active
- current_next_action: add operator runbook and validation evidence

## Tasks

1. Create WT-112 control artifacts.
   - status: completed
   - evidence: `.servo/worktrack/WT-20260601-112/contract.md`, `.servo/worktrack/WT-20260601-112/plan-task-queue.md`.
2. Add the MS-13 operator runtime runbook.
   - status: completed
   - evidence: `docs/ms13-runtime-operator-runbook.md`.
3. Refresh README and handoff entrypoints.
   - status: completed
   - evidence: `README.md`, `docs/handoff.md`.
4. Repair Docker-only Next build fallback if runtime smoke exposes it.
   - status: completed
   - evidence: `Dockerfile`, `package.json`, `docs/docker-web-runtime-env.md`.
5. Run validation gates.
   - status: completed
   - commands: `docker compose -f docker-compose.runtime.yml config`; `npm run build`; `git diff --check`; doc stale-claim scans; runtime smoke if local containers are available.
