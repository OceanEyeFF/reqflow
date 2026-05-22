---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-008-notification-user-surface"
milestone_id: "MS-20260522-003"
derived_from_milestone: "true"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-008-notification-user-surface
- branch: worktrack/WT-20260522-008-notification-user-surface
- baseline_branch: develop-aw
- baseline_ref: ff83e7a
- owner: servo-kernel
- updated: 2026-05-23
- contract_status: ready_for_close

## Node Type

- type: feature
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: test + review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-003`; `WT-20260522-007` is closed and refreshed into `develop-aw`.
- snapshot_freshness: fresh at `ff83e7a`; runtime database and log files remain local artifacts and must not be committed.
- milestone_purpose_alignment: exposes the existing notification backend as a real user-facing collaboration surface.
- historical_conflict_risk: medium because the change crosses shared dashboard layout, client state, notification APIs, and smoke coverage.
- worktrack_adjustment_recommendations: keep external messaging and broad notification preferences out of scope; verify existing in-app read state and ticket navigation.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- fallback_reason_required: yes
- carrier_decision: explorer subagent for read-only discovery; current-carrier for implementation because UI, smoke, and Gate evidence were tightly coupled.

## Task Goal

- Add and verify a user-visible in-app notification menu with unread count, notification list, read actions, and ticket navigation.

## Scope

### Control Signal

- Scope summary: Notification user surface for the existing in-app notification model and APIs.

### Supporting Detail

- In scope: dashboard header notification entry point, unread badge, notification dropdown, single-notification read action, all-read action, ticket links, and smoke evidence for manager-facing notifications.
- Out of scope: external email/push delivery, polling/websocket refresh, notification preference settings, schema changes, and new notification event categories beyond existing ticket assignment/status behavior.

## Acceptance Criteria

### Control Signal

- Core acceptance: a user can see unread notifications, inspect the list, mark one or all as read, and open the related ticket.

### Supporting Detail

- Header exposes an accessible notification button with unread count state.
- Notification list shows title, related ticket, timestamp, and read/unread visual state.
- Single read action decrements unread count without removing historical notifications.
- All-read action clears the unread count while preserving navigable notification history.
- Ticket links navigate to the target ticket detail page and are verified by URL and detail heading, not by dashboard card text.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- clean temp DB migration + seed + `npm run smoke`
- screenshot review for unread dropdown and ticket-link detail navigation
- code review for API method alignment and client state/read-count behavior

## Notes

- Playwright smoke uses installed Chrome channel.
- The local runtime database is not used for final smoke assertions; a clean temp SQLite DB avoids drift from manual browser testing.
