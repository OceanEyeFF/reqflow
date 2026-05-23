---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260522-009-member-comment-interaction-hardening"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260522-009-member-comment-interaction-hardening
- updated: 2026-05-23
- current_phase: verifying
- contract_ref: worktrack/contract.md
- queue_status: completed

## Task List

1. [x] Use explorer subagents to inspect member/comment API and UI/smoke gaps.
2. [x] Add access checks for ticket detail, comments, and members.
3. [x] Harden member role validation and admin/member modify semantics.
4. [x] Add ticket-detail member role controls, error feedback, and accessible comment/member controls.
5. [x] Extend smoke with non-participant 403 checks, member add/update, comment submit, member notification navigation, and member comment visibility.
6. [x] Run lint/build/db validation and clean temp DB smoke.
7. [x] Review screenshots and update Gate evidence.

## Current Next Action

### Control Signal

- selected_next_action: gate-member-comment-interaction-hardening
- selection_reason: Implementation and validation are complete; worktrack is ready for review and closeout.

## Readiness

- dispatch_packet_ready: true
- gate_evidence_ready: true
- recommended_next_route: WorktrackScope.Judge
