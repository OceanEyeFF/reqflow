---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-009-member-comment-interaction-hardening"
milestone_id: "MS-20260522-003"
derived_from_milestone: "true"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-009-member-comment-interaction-hardening
- branch: worktrack/WT-20260522-009-member-comment-interaction-hardening
- baseline_branch: develop-aw
- baseline_ref: 716c59e
- owner: servo-kernel
- updated: 2026-05-23
- contract_status: ready_for_close

## Node Type

- type: bugfix
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: test + review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-003`; `WT-20260522-007` and `WT-20260522-008` are closed and refreshed into `develop-aw`.
- snapshot_freshness: fresh at `716c59e`; runtime database and log files remain local artifacts and must not be committed.
- milestone_purpose_alignment: hardens the remaining member/comment collaboration surface before docs catch-up.
- historical_conflict_risk: medium because ticket detail combines comments, members, notifications, logs, access control, and smoke coverage.
- worktrack_adjustment_recommendations: include ticket-detail access control because comments and members are embedded in the ticket detail API response.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- fallback_reason_required: yes
- carrier_decision: two explorer subagents for read-only API/UI gap discovery; current-carrier for implementation and Gate because edits were tightly coupled across API, UI, and smoke.

## Task Goal

- Make member and comment collaboration reliable under accepted local roles.

## Scope

### Control Signal

- Scope summary: Member/comment access control, UI usability, and runtime smoke evidence.

### Supporting Detail

- In scope: ticket/comment/member access checks, member role validation, admin modify policy, member add/remove/update UI, comment submit UI, error feedback, log display, notifications through existing helpers, and smoke assertions.
- Out of scope: production-grade audit pipeline, rich role matrix redesign, realtime updates, external notifications, comment editing/deletion, and broad test-suite decomposition.

## Acceptance Criteria

### Control Signal

- Core acceptance: authorized users can add/update/remove collaborators and comment, while non-participants cannot read or write embedded collaboration data.

### Supporting Detail

- Non-participant logged-in users receive 403 for ticket detail, comments, and members on tickets they cannot access.
- Member POST accepts only `owner`, `collaborator`, and `watcher`; invalid users, duplicates, creator, and assignee duplication are rejected.
- Admin, creator, assignee, and owner-role members can modify members.
- Ticket detail exposes accessible controls for comment submit and member add/update/remove.
- Successful member and comment interactions refresh UI, show logs/comments, and use existing notification helpers.
- Smoke covers member notification navigation and member comment visibility.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- clean temp DB migration + seed + `npm run smoke`
- screenshot review for admin member/comment state and member-visible comment state
- code review for access control, role validation, and scoped cleanup behavior

## Notes

- Playwright smoke uses installed Chrome channel.
- The final smoke uses a clean temp SQLite DB to avoid local manual-test drift.
