---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260522-005-dashboard-ticket-flow-fixes"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260522-005-dashboard-ticket-flow-fixes
- updated: 2026-05-22
- current_phase: verifying
- contract_ref: worktrack/contract.md
- queue_status: completed

## Task List

1. [x] Reproduce and localize dashboard scope/count mismatch and priority label leakage.
2. [x] Apply the smallest behavior-preserving fixes in scoped client/API code.
3. [x] Extend smoke assertions to guard the fixed behavior.
4. [x] Run lint/build/db validate/smoke and inspect screenshots.
5. [x] Update gate evidence and close if all criteria pass.

## Current Next Action

### Control Signal
- selected_next_action: gate-dashboard-ticket-flow-fixes
- selection_reason: Implementation, regression smoke, screenshot review, and code review are complete.

### Supporting Detail
- selected_next_action_id: WT-20260522-005-T5
- selected_next_action: Run Gate for dashboard/ticket flow fixes.
- selection_reason: All worktrack acceptance criteria have fresh evidence.

## Dispatch Handoff Packet

- task: Fix dashboard/ticket flow defects found by smoke.
- goal_for_this_round: Make dashboard scope/list counts consistent and new-ticket priority labels user-facing.
- node_type: bugfix
- gate_criteria_for_this_round: implementation + validation + policy
- baseline_policy: commit-on-bugfix-branch, merge required
- constraints_for_this_round: targeted bugfix only; no schema/db binary changes; no broad redesign
- acceptance_criteria_for_this_round: dashboard active tab count/list align; priority select shows Chinese labels; smoke assertions and screenshots prove both
- verification_requirements: `npm run lint`; `npm run build`; `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`; `npm run smoke`; screenshot sanity check
- runtime_dispatch_mode: auto
- done_signal: gate evidence ready for closeout
- required_context: `.servo/worktrack/contract.md`, `src/app/api/tickets/route.ts`, `src/app/(dashboard)/tickets/new/page.tsx`, `tests/smoke/core-workflow.spec.ts`, browser smoke output
- return_to_schedule_if: product defects require scope beyond dashboard/ticket flow fixes

## Readiness

- dispatch_packet_ready: true
- gate_evidence_ready: true
- recommended_next_route: WorktrackScope.Judge

## Notes

- Current carrier fallback was used because no SubAgent dispatch shell was proven in this runtime.
