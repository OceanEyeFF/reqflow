---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260523-016-ticket-modify-permission-hardening"
milestone_id: "MS-20260522-003"
derived_from_milestone: "review-added"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260523-016-ticket-modify-permission-hardening
- branch: worktrack/WT-20260523-016-ticket-modify-permission-hardening
- baseline_branch: develop-aw
- baseline_ref: fc304d7
- owner: servo-kernel
- updated: 2026-05-23
- contract_status: ready_for_close

## Node Type

- type: bugfix
- source_from_review: final CodeReview preflight after WT-010
- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: test + review + policy

## Task Goal

- Close the review-found gap where ordinary collaborators/watchers could still PATCH ticket status, assignee, and priority.

## Scope

- In scope: ticket modify permission helper, ticket PATCH authorization, detail UI disabled controls for non-modifiers, and smoke assertion for collaborator PATCH 403.
- Out of scope: broader role matrix redesign, member/comment permissions already closed by WT-009, schema changes, and production audit policy.

## Acceptance Criteria

- Admin, creator, assignee, and owner-role collaborators can modify ticket fields.
- Ordinary collaborators/watchers can read/comment but cannot PATCH ticket mutable fields.
- UI disables status, assignee, and priority controls for non-modifying collaborators.
- Smoke proves an added collaborator receives 403 when attempting ticket PATCH.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- clean temp DB migration + seed + `npm run smoke`
