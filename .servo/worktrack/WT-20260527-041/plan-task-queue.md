# Plan / Task Queue: WT-20260527-041

## Metadata

- worktrack_id: WT-20260527-041
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current knowledge upload models/helpers and WT-039 design. | ready | Parser inputs clear |
| T2 | Add snippet schema and parser/chunker service. | ready | Uploaded sources become traceable snippets |
| T3 | Add API or service transition for parsing uploaded versions. | pending | Status becomes ready/failed |
| T4 | Add tests for document, zip, failed parse, and traceability. | pending | Coverage in place |
| T5 | Run lint/test/build and record evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- dispatch_ready: true

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
