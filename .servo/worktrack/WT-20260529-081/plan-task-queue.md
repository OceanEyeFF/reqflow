# Plan / Task Queue: WT-20260529-081

## Metadata

- worktrack_id: WT-20260529-081
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Queue

1. Confirm extension requirements from ADR and upstream docs.
   - status: completed
   - acceptance: pgvector, `pg_search`, and native FTS deployment constraints are reflected in docs and script behavior.

2. Add executable extension readiness checks.
   - status: completed
   - acceptance: script validates pgvector and native FTS and detects `pg_search`.

3. Wire dev/test/CI PostgreSQL image and scripts.
   - status: completed
   - acceptance: dev compose and CI can run extension readiness.

4. Document deployment decision and fallback.
   - status: completed
   - acceptance: `pg_search` deployability, fallback strategy, and WT-082 handoff are documented.

5. Run validation and record gate evidence.
   - status: completed
   - acceptance: required checks are captured in `.servo/worktrack/WT-20260529-081/gate-evidence.md`.

## Current Dispatch Candidate

- next_action: close WT-081 and refresh MS-9 state.
- carrier_decision: current-carrier.
- blocking_items: none.
