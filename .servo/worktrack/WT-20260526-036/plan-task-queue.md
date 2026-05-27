# Plan / Task Queue: WT-20260526-036

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-036 contract.
- Record baseline, scope, typed execution policy, acceptance criteria, and verification requirements.

### T2: Run independent safety review [completed]
- Dispatch read-only sidecar review for Deepseek, AI API, manual confirmation, MS7 scope, and test coverage.
- Triage findings and close actionable medium/low gaps inside WT-036 scope.

### T3: Close validation gaps [completed]
- Add draft handoff helper tests for deterministic description, staging, invalid draft cleanup, and manual discard.
- Make new-ticket prefill hydration-safe by loading staged draft after client mount.
- Clear staged AI draft after successful manual ticket creation.
- Return 400 for malformed `POST /api/ai/draft` JSON.

### T4: Execute regression and policy verification [completed]
- Run targeted policy searches.
- Run `npm ci`, `npm run lint`, `npm run test`, and `npm run build`.
- Record results and residual risks.

### T5: Gate, merge, refresh, and hand back [in_progress]
- Write WT-036 gate evidence and MS6 final validation report.
- Merge WT-036 to `develop`, clean up worktree/branch, refresh Harness state.
- Push `develop`, observe remote CI, and hand back MS6 for programmer acceptance decision.
