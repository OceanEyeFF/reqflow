---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-007-attachment-end-to-end-validation"
milestone_id: "MS-20260522-003"
derived_from_milestone: "true"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-007-attachment-end-to-end-validation
- branch: worktrack/WT-20260522-007-attachment-end-to-end-validation
- baseline_branch: develop-aw
- baseline_ref: a670c2c
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
- repo_fundamentals: active milestone `MS-20260522-003`; `MS-20260522-002` is accepted and completed; baseline branch is `develop-aw`.
- snapshot_freshness: fresh at `a670c2c`; main checkout and develop-aw runtime database files contain local dirty state and must not be committed.
- milestone_purpose_alignment: directly proves the attachment portion of the collaboration surface.
- historical_conflict_risk: medium because uploads touch API authorization, local file storage, UI, smoke tests, and ignored runtime artifacts.
- worktrack_adjustment_recommendations: keep storage productionization out of scope; prove local private-storage behavior and document residual production boundary later in WT-010.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- fallback_reason_required: yes
- carrier_decision: explorer subagent for read-only discovery; current-carrier for implementation because edits were tightly coupled across API/UI/smoke.

## Task Goal

- Verify and fix the local attachment upload/list/download/delete workflow for ticket detail.

## Scope

### Control Signal

- Scope summary: Attachment end-to-end validation and directly blocking fixes.

### Supporting Detail

- In scope: ticket detail attachment UI, attachment API authorization, private local file storage, authorized download route, smoke evidence, and ignored upload artifacts.
- Out of scope: production object storage, virus scanning, attachment preview, large upload resumability, external sharing, broad permission model redesign, and database schema changes.

## Acceptance Criteria

### Control Signal

- Core acceptance: an authorized user can upload, see, download, and delete a local attachment from the ticket detail page, and unauthenticated access is rejected.

### Supporting Detail

- Ticket detail page exposes a usable attachment card with file picker, upload button, attachment list, download link, size/uploader metadata, and delete action.
- Attachment files are not stored under public static routes; downloads go through an authenticated route.
- Attachment list/upload/delete routes verify ticket existence and ticket access.
- Local upload directories are ignored by git.
- Smoke evidence captures empty and uploaded attachment states.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- `$env:DATABASE_URL='file:./dev.db'; npx prisma migrate deploy` for the local validation database when `TicketAttachment` is absent
- `npm run smoke`
- screenshot review for ticket detail attachment states
- code review for unauthorized related-user 403 path and storage cleanup behavior

## Notes

- Playwright smoke uses installed Chrome channel.
- The local validation database was migrated for testing only; database binary changes must not be committed.
