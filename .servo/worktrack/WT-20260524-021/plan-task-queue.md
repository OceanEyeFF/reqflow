# Plan / Task Queue: WT-20260524-021

## Task Queue

### T1: Normalize canonical instructions [completed]
- add worktree workflow block to `AGENTS.md`
- keep `CLAUDE.md` as pointer to `AGENTS.md`

### T2: Document local AI/tool boundaries [completed]
- create `docs/ai-collaboration-entrypoints.md`
- classify `.agents`, `.claude`, `.harness`, `.mavis`, `.opencode`, `.playwright-mcp`

### T3: Validate [completed]
- `git diff --check` passed
- `npm run lint` passed
- `npm run test` passed; 10 files, 71 tests
- `npm run build` passed with worktree lockfile root warning

### T4: Gate and closeout [completed]
- gate evidence written
- ready for merge and M4 progress update
