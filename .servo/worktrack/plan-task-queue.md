---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260522-001-validation-environment-baseline"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260522-001-validation-environment-baseline
- updated: 2026-05-22
- current_phase: completed
- contract_ref: worktrack/contract.md
- queue_status: completed

## Task List

1. [x] Inspect installed Next.js docs relevant to workspace root/build behavior.
2. [x] Reproduce and classify validation command failures in the worktrack worktree.
3. [x] Add minimal non-secret validation environment guidance/config needed for reproducible commands.
4. [x] Re-run validation commands and capture results.
5. [x] Update gate evidence with review, validation, and policy surfaces.

## Execution Order Notes

- First confirm whether failures are environment/setup failures or code failures.
- Keep lint remediation findings as evidence for the next worktrack unless command execution itself is blocked.

## Dependencies

- Active milestone `MS-20260522-001`
- Baseline branch `develop-aw`
- Installed docs in the main checkout may be used as read-only reference because this worktree has no local `node_modules` until dependencies are installed.

## Current Blockers

- `npm run lint` still fails with existing code quality errors; this is intentionally left for `WT-20260522-002-lint-quality-baseline`.

## Current Next Action

### Control Signal
- selected_next_action: WorktrackScope.Verify
- selection_reason: Implementation is complete and validation evidence has been collected.

### Supporting Detail
- selected_next_action_id: WT-20260522-001-VERIFY
- selected_next_action: Verify and close the validation environment baseline.
- selection_reason: Build and Prisma validation now run with documented setup; lint is runnable and its failures are attributable to code quality.

## Dispatch Handoff Packet

- task: Establish validation environment baseline for ReqFlow worktree.
- goal_for_this_round: Make validation commands reproducible/interpretable without changing product behavior.
- node_type: config
- gate_criteria_for_this_round: validation + policy
- baseline_policy: commit-on-config-branch, merge required
- constraints_for_this_round: no product features, no broad lint fixes, no secrets, inspect Next docs before Next config changes
- acceptance_criteria_for_this_round: validation prerequisites documented; lint/build/prisma outputs captured; environment-caused failures separated from code findings
- verification_requirements: `npm run lint`; `npm run build`; `npx prisma validate` with documented `DATABASE_URL`; diff review
- runtime_dispatch_mode: auto
- done_signal: gate evidence ready for validation + policy judgment
- required_context: `.servo/worktrack/contract.md`, `.servo/milestone/MS-20260522-001.md`, `package.json`, `next.config.ts`, `prisma/schema.prisma`, `AGENTS.md`
- return_to_schedule_if: build/prisma failures reveal required product changes beyond validation setup

## Readiness

- dispatch_packet_ready: false
- recommended_next_route: WorktrackScope.Judge

## Notes

- Dispatch executed via current-carrier runtime fallback because no SubAgent shell was proven available.
