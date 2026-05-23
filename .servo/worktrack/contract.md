---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-010-collaboration-docs-catch-up"
milestone_id: "MS-20260522-003"
derived_from_milestone: "true"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-010-collaboration-docs-catch-up
- branch: worktrack/WT-20260522-010-collaboration-docs-catch-up
- baseline_branch: develop-aw
- baseline_ref: c6e9954
- owner: servo-kernel
- updated: 2026-05-23
- contract_status: ready_for_close

## Node Type

- type: docs
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

- Document verified collaboration behavior and non-production boundaries after WT-007, WT-008, and WT-009.

## Scope

- In scope: `README.md`, `docs/handoff.md`, and this worktrack's control artifacts.
- Out of scope: product code, schema changes, new tests, production storage decisions, external messaging decisions, and broad documentation restructure.

## Acceptance Criteria

- README smoke coverage reflects attachments, notifications, comments, and collaborator flows.
- Handoff checkpoint/status reflects WT-009 verified behavior and WT-010 docs catch-up.
- Documentation distinguishes local verified behavior from deferred production object storage, scanning, external messaging, realtime, audit, and richer role-matrix decisions.
- Stale text claiming the notification read-all route uses POST is absent.

## Verification Requirements

- stale-text search for collaboration docs
- `git diff --check -- README.md docs .servo`
- `npm run lint`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
