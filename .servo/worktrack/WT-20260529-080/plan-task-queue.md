# Plan / Task Queue: WT-20260529-080

## Metadata

- worktrack_id: WT-20260529-080
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Queue

1. Audit current SQLite-specific Prisma, migration, CI, test, seed, and docs bindings.
   - status: completed
   - acceptance: SQLite-specific binding list is reflected in implementation choices and docs.

2. Migrate Prisma datasource and migration baseline to PostgreSQL.
   - status: completed
   - acceptance: schema validates and migration status passes against PostgreSQL.

3. Update test and CI database preparation from SQLite files to PostgreSQL schemas/service.
   - status: completed
   - acceptance: tests use isolated PostgreSQL schemas and CI jobs use the PostgreSQL service.

4. Update docs and readiness scripts for the PostgreSQL provider boundary.
   - status: completed
   - acceptance: local dev/test/CI commands, rollback notes, and WT-081 handoff are documented.

5. Run validation and record gate evidence.
   - status: completed
   - acceptance: required checks are captured in `.servo/worktrack/WT-20260529-080/gate-evidence.md`.

## Current Dispatch Candidate

- next_action: close WT-080 and refresh MS-9 state.
- carrier_decision: current-carrier with explorer sidecar for read-only SQLite binding audit.
- blocking_items: none.
