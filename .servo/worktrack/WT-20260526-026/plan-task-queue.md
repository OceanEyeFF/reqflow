# Plan / Task Queue: WT-20260526-026

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-026 contract and plan queue.
- Record milestone intake review and typed execution policy.

### T2: Add GitHub Actions CI baseline [completed]
- Add `.github/workflows/ci.yml`.
- Cover `npm ci`, Prisma client generation, `npm run lint`, `npm run test`, Prisma build DB preparation, and `npm run build`.
- Configure CI-only `AUTH_SECRET`, `DATABASE_URL`, and Next telemetry opt-out.
- Ignore CI-only SQLite runtime files.

### T3: Validate locally [completed]
- Run `git diff --check`.
- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.

### T4: Gate and close [in_progress]
- Write WT-026 gate evidence.
- Merge WT-026 back to `develop`.
- Refresh repo and milestone state so WT-027 becomes the next MS5 worktrack.
