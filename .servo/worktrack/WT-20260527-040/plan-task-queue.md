# Plan / Task Queue: WT-20260527-040

## Metadata

- worktrack_id: WT-20260527-040
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect WT-039 design, existing attachment upload route, and Prisma patterns. | ready | Implementation inputs identified |
| T2 | Add knowledge upload metadata schema and private storage helpers. | ready | Raw upload record and storage key are safe |
| T3 | Add admin-only upload API with file and zip safety validation. | pending | Allowed docs/zip accepted; hostile input rejected |
| T4 | Add targeted route/helper tests. | pending | Auth and safety paths covered |
| T5 | Run lint/test/build and record gate evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- selected_task: Inspect WT-039 design, existing attachment upload route, and Prisma patterns.
- dispatch_ready: true

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- targeted `rg` for public upload path usage
