# Plan / Task Queue: WT-20260527-042

## Metadata

- worktrack_id: WT-20260527-042
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current static knowledge assembler and snippet schema. | ready | Retrieval inputs clear |
| T2 | Add lightweight persisted snippet selection. | ready | Enabled snippets become citations |
| T3 | Integrate selection into AI draft knowledge assembly. | pending | Draft provider receives bounded citations |
| T4 | Add tests for enabled-only selection and fallback. | pending | Safety covered |
| T5 | Run lint/test/build and record evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- dispatch_ready: true

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
