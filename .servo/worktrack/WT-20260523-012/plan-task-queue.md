# Plan / Task Queue: WT-20260523-012

## Task Queue

### T1: Extend shared helpers for Tickets tests [completed]
- added Prisma singleton reset and seed helpers

### T2: Cover `/api/tickets` and `/api/tickets/stats` [completed]
- unauthenticated, list success, create validation, create success, stats success

### T3: Cover `/api/tickets/[id]` [completed]
- detail success, missing ticket, invalid patch, patch success, delete auth, delete success

### T4: Verify Gate [completed]
- worktree `node node_modules\eslint\bin\eslint.js . --max-warnings=0` passed
- worktree `node node_modules\vitest\vitest.mjs run` passed; 5 files, 45 tests
- post-merge Gate still requires main checkout `npm run lint`, `npm run test`, `npm run build`
