---
title: "Worktrack Backlog"
artifact_type: "worktrack-backlog"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Backlog

## Worktracks

### WT-20260522-001-validation-environment-baseline

- worktrack_id: WT-20260522-001-validation-environment-baseline
- milestone_id: MS-20260522-001
- status: done
- node_type: config
- scope: validation environment baseline for worktree commands
- branch: worktrack/WT-20260522-001-validation-environment-baseline
- baseline_branch: develop-aw
- base_ref: a8e7b86
- merge_commit: ad6e18928365db2616b2731d0e93b4f9481992c3
- validation: build pass; db:validate pass with `.env.example` copied to ignored `.env`; lint runnable but fails with known downstream lint-quality findings
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### runtime-dashboard-route-hotfix

- worktrack_id: runtime-dashboard-route-hotfix
- milestone_id: N/A
- status: done
- node_type: bugfix
- scope: post-login runtime route fix for authenticated dashboard entry
- branch: worktrack/runtime-dashboard-route-hotfix
- baseline_branch: develop-aw
- base_ref: f4719c6
- merge_commit: 462ffd3f0d5accc5f82973f9c0fb6b9d696b0ffe
- validation: lint pass; build pass; db:validate pass; Playwright login smoke shows `工作台` and ticket API calls return 200
- intake_route: programmer runtime feedback
- evidence_refs: runtime smoke logs and Playwright snapshots
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-002-lint-quality-baseline

- worktrack_id: WT-20260522-002-lint-quality-baseline
- milestone_id: MS-20260522-001
- status: done
- node_type: bugfix
- scope: zero-error lint quality baseline without product feature expansion
- branch: worktrack/WT-20260522-002-lint-quality-baseline
- baseline_branch: develop-aw
- base_ref: 6137624
- merge_commit: a16986e4e126a531fd613aa9204f9bfd16b0f3f5
- validation: lint pass; build pass; db:validate pass after documented local setup
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-003-docs-handoff-catch-up

- worktrack_id: WT-20260522-003-docs-handoff-catch-up
- milestone_id: MS-20260522-001
- status: done
- node_type: docs
- scope: operator-facing handoff documentation catch-up from verified baseline facts
- branch: worktrack/WT-20260522-003-docs-handoff-catch-up
- baseline_branch: develop-aw
- base_ref: b62e4b0
- merge_commit: 28a7966dd248affd9b6099340d59433f48d51d8a
- validation: lint pass; build pass; db:validate pass; stale-text search pass
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-004-runtime-smoke-suite

- worktrack_id: WT-20260522-004-runtime-smoke-suite
- milestone_id: MS-20260522-002
- status: done
- node_type: test
- scope: repeatable Playwright runtime smoke suite for login, dashboard, ticket list/detail, new-ticket reachability, and logout
- branch: worktrack/WT-20260522-004-runtime-smoke-suite
- baseline_branch: develop-aw
- base_ref: 80621ea
- merge_commit: 426c8a5f32af7ce8b595cc5b694a8306d0ee831c
- validation: lint pass; build pass; db:validate pass; smoke pass with installed Chrome channel; screenshots generated under ignored `test-results/smoke/`
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-005-dashboard-ticket-flow-fixes

- worktrack_id: WT-20260522-005-dashboard-ticket-flow-fixes
- milestone_id: MS-20260522-002
- status: done
- node_type: bugfix
- scope: dashboard/ticket flow fixes for admin personal scope filtering and new-ticket priority label display
- branch: worktrack/WT-20260522-005-dashboard-ticket-flow-fixes
- baseline_branch: develop-aw
- base_ref: e2a33a1
- merge_commit: 41c0649ec9e38ae46ed7ce29d5f693c6a6eb47b8
- validation: lint pass; build pass; db:validate pass; smoke pass; screenshots confirm dashboard assigned list/count and priority label display are fixed
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-006-runtime-docs-catch-up

- worktrack_id: WT-20260522-006-runtime-docs-catch-up
- milestone_id: MS-20260522-002
- status: done
- node_type: docs
- scope: operator-facing runtime smoke workflow and local runtime caveat documentation
- branch: worktrack/WT-20260522-006-runtime-docs-catch-up
- baseline_branch: develop-aw
- base_ref: 73d596f
- merge_commit: d59e734213a57502e174fdf35b58fc128f21f522
- validation: lint pass; build pass; db:validate pass; stale-text search pass
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-015-ms002-final-handoff-refresh

- worktrack_id: WT-20260522-015-ms002-final-handoff-refresh
- milestone_id: MS-20260522-002
- status: done
- node_type: docs
- scope: final MS-002 handoff freshness fix after CodeReview found stale current-worktrack wording
- branch: worktrack/WT-20260522-015-ms002-final-handoff-refresh
- baseline_branch: develop-aw
- base_ref: 9a9d4c1
- merge_commit: a78cc4b85a618a035e466fdb6e541c815f2daf66
- validation: lint pass; db:validate pass; diff-check pass; stale current-worktrack search pass
- intake_route: review-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-22
- updated: 2026-05-22

### WT-20260522-007-attachment-end-to-end-validation

- worktrack_id: WT-20260522-007-attachment-end-to-end-validation
- milestone_id: MS-20260522-003
- status: done
- node_type: bugfix
- scope: attachment upload/list/download/delete workflow with private local storage and ticket access checks
- branch: worktrack/WT-20260522-007-attachment-end-to-end-validation
- baseline_branch: develop-aw
- base_ref: a670c2c
- merge_commit: cc6e22bf0c97493ceef17a3a74f51cf77fa29255
- validation: lint pass; build pass; db:validate pass; local validation DB migrate deploy pass; smoke pass against clean migrated/seeded temp DB; screenshots reviewed
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-23
- updated: 2026-05-23

### WT-20260523-016-ticket-modify-permission-hardening

- worktrack_id: WT-20260523-016-ticket-modify-permission-hardening
- milestone_id: MS-20260522-003
- status: done
- node_type: bugfix
- scope: restrict mutable ticket PATCH fields to admin, creator, assignee, and owner-role collaborators
- branch: worktrack/WT-20260523-016-ticket-modify-permission-hardening
- baseline_branch: develop-aw
- base_ref: fc304d7
- merge_commit: 541bbd73bf3383ea59c4760c1f95457e482dad0f
- validation: lint pass; build pass; db:validate pass; clean temp DB migrate/seed/smoke pass with collaborator PATCH 403 assertion
- intake_route: final-code-review-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-23
- updated: 2026-05-23

### WT-20260522-010-collaboration-docs-catch-up

- worktrack_id: WT-20260522-010-collaboration-docs-catch-up
- milestone_id: MS-20260522-003
- status: done
- node_type: docs
- scope: README and handoff documentation catch-up for verified collaboration behavior and deferred production boundaries
- branch: worktrack/WT-20260522-010-collaboration-docs-catch-up
- baseline_branch: develop-aw
- base_ref: c6e9954
- merge_commit: 409de4ecbae5e0c69c42e4e4e66f685e33e66e2f
- validation: lint pass; build pass; db:validate pass; stale-text reverse search pass; diff-check pass
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-23
- updated: 2026-05-23

### WT-20260522-009-member-comment-interaction-hardening

- worktrack_id: WT-20260522-009-member-comment-interaction-hardening
- milestone_id: MS-20260522-003
- status: done
- node_type: bugfix
- scope: member/comment access control, member role UI, comment UI feedback, and smoke coverage
- branch: worktrack/WT-20260522-009-member-comment-interaction-hardening
- baseline_branch: develop-aw
- base_ref: 716c59e
- merge_commit: 0e1807a251bc3c79e0967b8ceda6a3ee09c7ae92
- validation: lint pass; build pass; db:validate pass; clean temp DB migrate/seed/smoke pass; screenshots reviewed for admin member/comment state and member-visible comments
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-23
- updated: 2026-05-23

### WT-20260522-008-notification-user-surface

- worktrack_id: WT-20260522-008-notification-user-surface
- milestone_id: MS-20260522-003
- status: done
- node_type: feature
- scope: notification bell, unread list/menu, single-read, all-read, and ticket-link workflow
- branch: worktrack/WT-20260522-008-notification-user-surface
- baseline_branch: develop-aw
- base_ref: ff83e7a
- merge_commit: 8568578686d0cec1d6732784771381bfb63b05ae
- validation: lint pass; build pass; db:validate pass; clean temp DB migrate/seed/smoke pass; screenshots reviewed and ticket-link assertion hardened to URL plus detail heading
- intake_route: milestone-derived
- evidence_refs: `.servo/worktrack/gate-evidence.md`
- completed_at: 2026-05-23
- updated: 2026-05-23
