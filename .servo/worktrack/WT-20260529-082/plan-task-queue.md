# Plan / Task Queue: WT-20260529-082

## Metadata

- worktrack_id: WT-20260529-082
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Queue

1. Create fixed Chinese retrieval evaluation cases.
   - status: completed
   - acceptance: cases cover expected sources/snippets, must terms, forbidden sources, recall/noise thresholds, and citation traceability.

2. Add executable evaluation corpus gate.
   - status: completed
   - acceptance: script validates schema and thresholds and supports future result-file checks.

3. Document evaluation harness and anti-cheat boundaries.
   - status: completed
   - acceptance: docs explain result contract and MS-10 handoff.

4. Wire CI/package script and validate.
   - status: completed
   - acceptance: gate, lint, test, and build pass.

5. Record gate evidence and close.
   - status: completed
   - acceptance: `.servo/worktrack/WT-20260529-082/gate-evidence.md` records all required checks.

## Current Dispatch Candidate

- next_action: close WT-082 and hand MS-9 to fdch0 for final milestone acceptance decision.
- carrier_decision: current-carrier.
- blocking_items: none.
