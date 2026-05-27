# Plan / Task Queue: WT-20260528-049

## Metadata

- worktrack_id: WT-20260528-049
- status: planned
- updated: 2026-05-28

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current source/version/snippet/storage cleanup paths. | ready | Delete strategy clear |
| T2 | Add admin delete and clear API actions. | pending | Cleanup operations exist |
| T3 | Add UI controls with confirmation semantics. | pending | Operator can clean mistakes |
| T4 | Add security and retrieval regression tests. | pending | Non-admin blocked and stale snippets excluded |
| T5 | Run lint/test/build and record evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- dispatch_ready: false

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
