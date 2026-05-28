# Plan / Task Queue: WT-20260528-058

## Metadata

- worktrack_id: WT-20260528-058
- status: active
- updated: 2026-05-28

## Queue

| id | status | task | acceptance_slice |
|----|--------|------|------------------|
| Q1 | done | Initialize worktree, contract, and queue | WT-058 artifacts exist |
| Q2 | done | Add language mode request/provider typing | parser defaults and provider request carries mode |
| Q3 | done | Add AI discussion UI control | page sends selected mode |
| Q4 | done | Add provider/test coverage | payload includes language instruction |
| Q5 | done | Run verification and close evidence | lint/test/build evidence recorded |

## Verification Requirements

- `npm run lint` passed on 2026-05-28.
- `npm run test` passed on 2026-05-28: 27 files, 180 tests.
- `npm run build` passed on 2026-05-28 with non-blocking Next worktree root warning.
