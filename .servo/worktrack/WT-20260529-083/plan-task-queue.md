# Plan / Task Queue: WT-20260529-083

## Metadata

- worktrack_id: WT-20260529-083
- status: initialized
- branch: worktrack/wt-20260529-083-knowledge-search-index-schema
- baseline_ref: 64b23419b263f5d4aa21c007e6efd06b2886138b

## Queue

| # | task | status | validation |
|---|------|--------|------------|
| 1 | Inspect current knowledge schema, migrations, and MS-9 architecture docs for required WT-083 fields. | pending | Notes captured in gate evidence. |
| 2 | Design SearchIndexProfile and snippet metadata schema with profile/status/dimensions/content hash boundaries. | pending | Prisma schema diff reviewed against contract criteria. |
| 3 | Add Prisma schema changes and a PostgreSQL migration with rollback notes. | pending | `npx prisma validate` and migration status/apply checks. |
| 4 | Add focused tests or schema-level validation for profile and metadata invariants. | pending | Focused tests pass. |
| 5 | Run lint, tests, build, and PostgreSQL readiness checks. | pending | Commands recorded in gate evidence. |
| 6 | Update docs/artifacts, backlog status, and prepare closeout evidence. | pending | Gate evidence and worktrack backlog updated. |

## Dispatch Seed

- recommended_next_scope: WorktrackScope
- recommended_next_function: Dispatch
- recommended_carrier: auto
- implementation_boundary: WT-083 contract only
- current_next_task: schema and migration implementation

