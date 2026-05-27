# Plan / Task Queue: WT-20260528-048

## Metadata

- worktrack_id: WT-20260528-048
- status: planned
- updated: 2026-05-28

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Reproduce current zip upload/parse behavior. | ready | Failure mode known |
| T2 | Fix zip parsing or UI-facing representation as needed. | pending | Zip source works as folder-like source |
| T3 | Add zip regression tests. | pending | Safety and path grouping covered |
| T4 | Run lint/test/build and record evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- dispatch_ready: false

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
