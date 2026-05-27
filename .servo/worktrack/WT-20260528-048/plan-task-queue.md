# Plan / Task Queue: WT-20260528-048

## Metadata

- worktrack_id: WT-20260528-048
- status: completed
- updated: 2026-05-28

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Reproduce current zip upload/parse behavior. | completed | Existing parser only handled stored/local-header zip entries; real `docs.zip` verified after fix with 18 entries |
| T2 | Fix zip parsing or UI-facing representation as needed. | completed | Zip source works as folder-like source with inner paths preserved |
| T3 | Add zip regression tests. | completed | Stored, deflated, data-descriptor/central-directory, safety, and path grouping covered |
| T4 | Run lint/test/build and record evidence. | completed | Gates pass |

## Current Next Action

- selected_task_id: none
- dispatch_ready: false

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
