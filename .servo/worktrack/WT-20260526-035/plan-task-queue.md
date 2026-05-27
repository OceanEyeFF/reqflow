# Plan / Task Queue: WT-20260526-035

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-035 contract.
- Record baseline, scope, typed execution policy, acceptance criteria, and verification requirements.

### T2: Implement draft staging from discussion page [completed]
- Compose draft into ticket-form fields.
- Store staged draft in `sessionStorage`.
- Navigate to `/tickets/new?from=ai-draft`.

### T3: Implement new-ticket prefill and clear action [completed]
- Read staged draft on mount.
- Prefill title, description, type, and priority.
- Show AI-draft notice and clear action.

### T4: Validate and close [completed]
- Run targeted policy searches.
- Run `npm run lint`, `npm run test`, and `npm run build`.
- Write gate evidence and merge back to `develop`.
