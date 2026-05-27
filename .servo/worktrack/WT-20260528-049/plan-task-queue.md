# Plan / Task Queue: WT-20260528-049

## Metadata

- worktrack_id: WT-20260528-049
- status: completed
- updated: 2026-05-28

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current source/version/snippet/storage cleanup paths. | completed | Hard delete with cascade and best-effort private file cleanup selected |
| T2 | Add admin delete and clear API actions. | completed | `DELETE /sources/[id]` and `DELETE /sources` added with confirmation phrases |
| T3 | Add UI controls with confirmation semantics. | completed | Single-source delete and full clear controls added |
| T4 | Add security and retrieval regression tests. | completed | Non-admin blocked and stale snippets excluded after cleanup |
| T5 | Run lint/test/build and record evidence. | completed | Gates pass |

## Current Next Action

- selected_task_id: none
- dispatch_ready: false

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
