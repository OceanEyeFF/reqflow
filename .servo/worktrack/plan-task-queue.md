---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260522-004-runtime-smoke-suite"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260522-004-runtime-smoke-suite
- updated: 2026-05-22
- current_phase: verifying
- contract_ref: worktrack/contract.md
- queue_status: completed

## Task List

1. [x] Inspect existing app routes, seed data, and installed Next.js/Playwright constraints relevant to runtime smoke.
2. [x] Add the minimal smoke runner/test and npm script without changing product behavior.
3. [x] Run validation commands and browser smoke; collect screenshots/log evidence.
4. [x] Document the accepted smoke workflow and any runtime blockers routed to WT-005.
5. [x] Update gate evidence for review, validation, and policy lanes.

## Current Next Action

### Control Signal
- selected_next_action: gate-runtime-smoke-suite
- selection_reason: Smoke harness and docs are implemented; lint, build, db validate, and runtime smoke pass.

### Supporting Detail
- selected_next_action_id: WT-20260522-004-T5
- selected_next_action: Run Gate for runtime smoke suite.
- selection_reason: All planned queue items have produced evidence.

## Dispatch Handoff Packet

- task: Add repeatable runtime smoke coverage.
- goal_for_this_round: Establish a local browser-level smoke command for login and core ticket navigation.
- node_type: test
- gate_criteria_for_this_round: validation + policy
- baseline_policy: commit-on-test-branch, merge required
- constraints_for_this_round: validation-only; no broad product fixes; route runtime blockers to WT-005
- acceptance_criteria_for_this_round: login/dashboard/tickets/new-ticket/logout smoke coverage or explicit blocker evidence; validation commands stay passing
- verification_requirements: `npm run lint`; `npm run build`; `npm run db:validate`; `npm run smoke`; screenshots
- runtime_dispatch_mode: auto
- done_signal: gate evidence ready for closeout
- required_context: `.servo/worktrack/contract.md`, `package.json`, `playwright.config.ts`, `tests/smoke/core-workflow.spec.ts`, `docs/handoff.md`, browser smoke output
- return_to_schedule_if: product defects require fixes outside smoke harness scope

## Readiness

- dispatch_packet_ready: true
- gate_evidence_ready: true
- recommended_next_route: WorktrackScope.Judge

## Notes

- Current carrier fallback was used because no SubAgent dispatch shell was proven in this runtime.
- Playwright managed Chromium download failed due repeated TLS resets; smoke was verified with installed Chrome channel.
