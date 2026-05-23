# Plan / Task Queue: WT-20260523-011

## Task Queue

### T1: Define test fixture boundaries [completed]
- test DB path: `prisma/test-dbs/`
- auth mock target: `@/auth.auth()`
- route request helpers: `NextRequest`, promised params, JSON response parsing

### T2: Implement shared helpers [completed]
- file: `src/test/api-test-helpers.ts`

### T3: Add helper self-tests [completed]
- file: `src/test/api-test-helpers.test.ts`

### T4: Document route testing pattern [completed]
- file: `docs/api-route-testing.md`

### T5: Verify gate [completed]
- worktree verification: `npm run lint`, `npm run test`
- post-merge verification required: `npm run build`
