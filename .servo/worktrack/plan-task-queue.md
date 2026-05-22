---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260522-008-notification-user-surface"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260522-008-notification-user-surface
- updated: 2026-05-23
- current_phase: verifying
- contract_ref: worktrack/contract.md
- queue_status: completed

## Task List

1. [x] Inspect existing notification model, API routes, generation helpers, and UI gap.
2. [x] Add dashboard header notification menu with unread badge and dropdown list.
3. [x] Wire single-read, all-read, and ticket navigation through existing notification APIs.
4. [x] Extend smoke coverage with manager notification unread count, list, read actions, all-read action, and detail-page navigation.
5. [x] Review screenshots and strengthen navigation assertions after the first screenshot exposed a weak dashboard-title match.
6. [x] Run lint/build/db validation and clean temp DB smoke.
7. [x] Update Gate evidence for closeout.

## Current Next Action

### Control Signal

- selected_next_action: gate-notification-user-surface
- selection_reason: Implementation and validation are complete; worktrack is ready for review and closeout.

## Readiness

- dispatch_packet_ready: true
- gate_evidence_ready: true
- recommended_next_route: WorktrackScope.Judge
