# Plan / Task Queue: WT-20260524-022

## Task Queue

### T1: Remove DB files from Git tracking [completed]
- `git rm --cached dev.db prisma/dev.db prisma/dev.db-journal`

### T2: Add local DB ignore policy [completed]
- ignore root and Prisma SQLite DB/journal files
- ignore nested `prisma/prisma/` runtime output

### T3: Document governance policy [completed]
- create `docs/prisma-dev-db-governance.md`

### T4: Validate [completed]
- `git ls-files` DB check passed; DB files no longer tracked while schema/seed/migrations remain tracked
- `git check-ignore` DB check passed
- `git diff --check` passed
- `npm run lint` passed
- `npm run test` passed; 10 files, 71 tests
- `npm run build` passed with worktree lockfile root warning

### T5: Gate and closeout [completed]
- gate evidence written
- ready for merge and M4 progress update
