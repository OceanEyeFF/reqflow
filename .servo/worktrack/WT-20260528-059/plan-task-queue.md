# Plan / Task Queue: WT-20260528-059

## Metadata

- worktrack_id: WT-20260528-059
- status: active
- updated: 2026-05-28

## Queue

| id | status | task | acceptance_slice |
|----|--------|------|------------------|
| Q1 | done | Initialize worktrack artifacts | WT-059 contract and queue exist |
| Q2 | done | Extend draft/provider types and max draft config | provider request carries capped max |
| Q3 | done | Normalize single and multi-draft provider output | `draft` compatibility plus capped `drafts` |
| Q4 | done | Update AI discussion candidate selection UI | each candidate has its own accept action |
| Q5 | done | Add targeted tests and run verification | targeted, lint, test, build evidence recorded |

## Verification Requirements

- Targeted AI draft/provider/route tests passed on 2026-05-28: 3 files, 22 tests.
- `npm run lint` passed on 2026-05-28.
- `npm run test` passed on 2026-05-28: 27 files, 184 tests.
- `npm run build` passed on 2026-05-28 with non-blocking Next worktree root warning.
