---
title: "Worktrack Backlog"
artifact_type: "worktrack-backlog"
updated: "2026-05-22"
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
