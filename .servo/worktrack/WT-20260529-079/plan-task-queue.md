# Plan / Task Queue: WT-20260529-079

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-079 contract and plan queue.
- Record PostgreSQL readiness scope and WT-080 boundary.

### T2: Add local PostgreSQL service baseline [completed]
- Add `docker-compose.postgres.yml`.
- Add `postgres:wait` and `postgres:readiness` scripts.

### T3: Add CI PostgreSQL readiness lane [completed]
- Add PostgreSQL 16 service job.
- Keep existing SQLite lint/test/build baseline unchanged.

### T4: Document dev/test/CI boundary [completed]
- Add `docs/postgres-dev-test-ci-baseline.md`.
- Record current SQLite provider and WT-080 migration handoff.

### T5: Validate and close [completed]
- Run static checks and project validation.
- Record gate evidence and closeout updates.
