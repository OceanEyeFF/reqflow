---
title: "Milestone Backlog"
artifact_type: "milestone-backlog"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Milestone Backlog

## Pipeline Summary

- active_milestone: MS-20260522-003
- planned_count: 1
- active_count: 1
- completed_count: 2
- superseded_count: 0
- updated: 2026-05-23

## Milestones

### MS-20260522-001

- milestone_id: MS-20260522-001
- title: Establish Verifiable Governance Baseline
- purpose: Establish a verified ReqFlow governance baseline before trusting or extending the MiniMax-initialized application.
- status: completed
- milestone_kind: goal-driven
- priority: 1
- depends_on_milestones: N/A
- worktrack_list:
  - WT-20260522-001-validation-environment-baseline (done, config)
  - WT-20260522-002-lint-quality-baseline (done, bugfix)
  - WT-20260522-003-docs-handoff-catch-up (done, docs)
- created_by: programmer-confirmed-harness
- created_at: 2026-05-22
- updated_by: harness-skill
- updated: 2026-05-23
- activation_rules: active_immediately

### MS-20260522-002

- milestone_id: MS-20260522-002
- title: Runtime Usability And Smoke Acceptance
- purpose: Turn the newly verified baseline into a manually usable application by adding repeatable runtime smoke coverage and fixing the first layer of blocking UX/runtime defects.
- status: completed
- milestone_kind: goal-driven
- priority: 2
- depends_on_milestones: MS-20260522-001
- worktrack_list:
  - WT-20260522-004-runtime-smoke-suite (done, test)
  - WT-20260522-005-dashboard-ticket-flow-fixes (done, bugfix)
  - WT-20260522-006-runtime-docs-catch-up (done, docs)
  - WT-20260522-015-ms002-final-handoff-refresh (done, docs)
- created_by: programmer-confirmed-harness
- created_at: 2026-05-22
- updated_by: harness-skill
- updated: 2026-05-23
- activation_rules: active_immediately

### MS-20260522-003

- milestone_id: MS-20260522-003
- title: Collaboration Surface Acceptance
- purpose: Close the gap between existing collaboration-related models/APIs and a user-visible, tested collaboration experience for attachments, notifications, members, and comments.
- status: active
- milestone_kind: goal-driven
- priority: 3
- depends_on_milestones: MS-20260522-002
- worktrack_list:
  - WT-20260522-007-attachment-end-to-end-validation (done, bugfix)
  - WT-20260522-008-notification-user-surface (done, feature)
  - WT-20260522-009-member-comment-interaction-hardening (planned, bugfix)
  - WT-20260522-010-collaboration-docs-catch-up (planned, docs)
- created_by: programmer-confirmed-harness
- created_at: 2026-05-22
- updated_by: harness-skill
- updated: 2026-05-23
- activation_rules: activate_after MS-20260522-002

### MS-20260522-004

- milestone_id: MS-20260522-004
- title: Operational Readiness Foundation
- purpose: Establish the next layer of maintainable operations for ReqFlow: minimal admin/user management, search usability, and explicit production-readiness decisions.
- status: planned
- milestone_kind: goal-driven
- priority: 4
- depends_on_milestones: MS-20260522-003
- worktrack_list:
  - WT-20260522-011-user-admin-minimum-surface (planned, feature)
  - WT-20260522-012-search-filter-usability-baseline (planned, feature)
  - WT-20260522-013-production-readiness-strategy-spike (planned, research)
  - WT-20260522-014-operational-docs-catch-up (planned, docs)
- created_by: programmer-confirmed-harness
- created_at: 2026-05-22
- updated_by: harness-skill
- updated: 2026-05-22
- activation_rules: activate_after MS-20260522-003
