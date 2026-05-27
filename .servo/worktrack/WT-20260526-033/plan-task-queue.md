# Plan / Task Queue: WT-20260526-033

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-033 contract.
- Record baseline, scope, typed execution policy, acceptance criteria, and verification requirements.

### T2: Implement AI draft domain and knowledge helpers [completed]
- Add provider-neutral types.
- Add knowledge source whitelist and safe context assembly.
- Add redaction and draft description formatting helpers.

### T3: Implement Deepseek adapter and route handler [completed]
- Add server-side provider adapter.
- Add authenticated route handler.
- Ensure route returns clarification or draft without mutating tickets.

### T4: Add tests [completed]
- Add helper unit tests.
- Add route tests with mocked provider behavior.
- Cover auth, weak input, success, failure, missing secret, empty-context fallback, and no direct ticket creation.

### T5: Validate and close [in_progress]
- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.
- Write gate evidence and merge back to `develop`.
