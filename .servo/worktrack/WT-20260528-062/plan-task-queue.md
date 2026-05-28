# Plan / Task Queue: WT-20260528-062

## Metadata

- worktrack_id: WT-20260528-062
- status: planned
- updated: 2026-05-28

## Queue

| id | status | task | acceptance_slice |
|----|--------|------|------------------|
| Q1 | pending | Check dependency and Prisma Client health | `@prisma/client` and generated client are available |
| Q2 | pending | Check active `DATABASE_URL` and Prisma schema validation | env and `npx prisma validate` pass |
| Q3 | pending | Check migration status and repair drift only non-destructively if needed | migrate status is up to date |
| Q4 | pending | Verify active DB schema surfaces used by MS8 | knowledge base/source/version/snippet/provider tables and fields exist |
| Q5 | pending | Verify admin knowledge-base endpoint readiness | no schema-related server error |
| Q6 | pending | Record gate evidence and MS8 handback state | evidence is sufficient for final acceptance decision |

## Verification Requirements

- Do not run destructive database commands such as reset, drop, or blanket deletes.
- Any migration-history repair must use explicit non-destructive Prisma migration resolve steps and be recorded.
- The worktrack closes only after database status and endpoint readiness are proven against the active checkout/database.
