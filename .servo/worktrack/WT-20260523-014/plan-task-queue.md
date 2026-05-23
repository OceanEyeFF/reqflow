# Plan / Task Queue: WT-20260523-014

## Task Queue

### T1: Cover attachments route [completed]
- auth failure, missing ticket, missing file, upload success, forbidden delete, delete success

### T2: Cover notifications routes [completed]
- list unread, batch patch, single patch ownership, read-all

### T3: Verify upload cleanup [completed]
- no `public/uploads/route-test-*` files remain after route tests

### T4: Verify Gate [completed]
- worktree `npm run lint` passed
- worktree `npm run test` passed; 10 files, 71 tests
- post-merge Gate still requires main checkout `npm run lint`, `npm run test`, `npm run build`
