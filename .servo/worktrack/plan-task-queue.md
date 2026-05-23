---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
worktrack_id: "WT-20260523-016-ticket-modify-permission-hardening"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Plan / Task Queue

## Metadata

- worktrack_id: WT-20260523-016-ticket-modify-permission-hardening
- updated: 2026-05-23
- current_phase: verifying
- queue_status: completed

## Task List

1. [x] Identify review-found PATCH permission gap for ordinary collaborators/watchers.
2. [x] Add `canModifyTicket` helper and use it for ticket PATCH.
3. [x] Disable ticket mutable controls for non-modifying collaborators in the detail UI.
4. [x] Extend smoke with collaborator status-control disabled and PATCH 403 assertions.
5. [x] Run lint/build/db validation and clean temp DB smoke.

## Current Next Action

- selected_next_action: close-ticket-modify-permission-hardening
- recommended_next_route: WorktrackScope.Close
