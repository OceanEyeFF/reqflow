---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
worktrack_id: "WT-20260522-004-runtime-smoke-suite"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Gate Evidence

## Metadata

- worktrack_id: WT-20260522-004-runtime-smoke-suite
- updated: 2026-05-22
- gate_round: 1
- required_evidence_lanes: validation, policy
- review_profile: standard

## Review Lane

### Control Signal
- review_subagent_lanes: N/A
- review_profile: standard
- four_lane_dispatch_status: current-carrier-fallback
- confidence: high
- ready_for_gate: true
- residual_risks: The smoke confirms core navigation on local seed data, not full production readiness or exhaustive feature coverage.

### Supporting Detail
- input_ref: `.servo/worktrack/contract.md`
- freshness: current
- static_semantic_review: pass; smoke harness is isolated to `playwright.config.ts` and `tests/smoke/core-workflow.spec.ts`, with `package.json` script and ignored report outputs.
- test_review: pass; smoke uses role/label selectors where stable and records screenshots for dashboard, ticket detail, ticket list, and new-ticket form.
- code_review: pass; final review corrected a documentation checkpoint wording issue so `80621ea` is described as the milestone planning baseline, not as a repo-refresh checkpoint.
- project_security_review: pass; no secrets were added, local `AUTH_SECRET` is provided only through Playwright webServer env, and `.env` remains ignored.
- complexity_performance_review: pass; single Chromium/Chrome project, serial smoke, no broad fixture or product-code coupling.
- four_lane_fallback_reason: no SubAgent dispatch shell proven; current-carrier fallback preserved the dispatch package scope.
- missing_evidence: N/A
- upstream_constraint_signals: `.servo/worktrack/contract.md#Constraints`
- low_severity_absorption_applied: no

## Validation Lane

### Control Signal
- confidence: high
- ready_for_gate: true
- residual_risks: Playwright managed Chromium download failed in this network environment, so the verified smoke path uses installed Chrome channel.

### Supporting Detail
- input_ref: worktrack command probes and screenshot review on 2026-05-22
- freshness: current
- missing_evidence: N/A
- upstream_constraint_signals: `npm run lint` pass; `npm run build` pass; `DATABASE_URL=file:./dev.db npm run db:validate` pass; `npm run smoke` pass.
- command_evidence:
  - `npm run lint`: pass.
  - `npm run build`: pass, Next.js 16.2.6 production build and TypeScript check completed.
  - `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`: pass, Prisma schema valid.
  - `npm run smoke`: pass, 1 Playwright test passed using installed Chrome channel.
  - `npx playwright install chromium`: failed after repeated TLS reset; treated as environment download limitation, not product failure.
- screenshot_evidence:
  - `test-results/smoke/01-dashboard.png`: dashboard reachable after login; sanity issue found where stats/list count disagree.
  - `test-results/smoke/02-ticket-detail.png`: ticket detail reachable with comments, status, details, and collaborator sections visible.
  - `test-results/smoke/03-ticket-list.png`: ticket list reachable and example ticket visible.
  - `test-results/smoke/04-new-ticket.png`: new-ticket form reachable; sanity issue found where priority select displays internal value.
- low_severity_absorption_applied: no

## Policy Lane

### Control Signal
- confidence: high
- ready_for_gate: true
- residual_risks: Product defects found by smoke are routed to existing `WT-20260522-005-dashboard-ticket-flow-fixes` instead of being fixed in this test worktrack.

### Supporting Detail
- input_ref: `AGENTS.md`, `.servo/goal-charter.md`, `.servo/milestone/MS-20260522-002.md`
- freshness: current
- missing_evidence: N/A
- upstream_constraint_signals: all changes occurred in worktree `WT-20260522-004-runtime-smoke-suite`; baseline branch remains `develop-aw`; scope stayed validation/docs only; no database binaries or uploads were intentionally changed.
- low_severity_absorption_applied: no

## Evidence Assessment

### Control Signal
- node_type: test
- applied_gate_criteria: validation + policy
- fallback_used: true
- overall_confidence: high
- overall_confidence_reason: The worktrack adds a repeatable smoke command, validates the core authenticated workflow in a real browser, records screenshots, and keeps discovered product fixes out of scope for WT-005.
- freshness_blockers: N/A

### Supporting Detail
- node_type_source: `.servo/goal-charter.md#Engineering Node Map`
- diff_surface_summary: Added Playwright dev dependency, `smoke` script, Playwright config, core smoke spec, ignored Playwright outputs, ESLint ignores for Playwright artifacts, handoff smoke docs, and worktrack evidence updates.
- git_diff_stat: 10 files changed before evidence closeout update.

## Per-Surface Verdicts

### Control Signal
- implementation_surface: pass
- validation_surface: pass
- policy_surface: pass
- low_severity_absorption_reason: N/A

### Supporting Detail
- Implementation surface covers only test harness and docs, not product behavior.
- Validation surface is supported by lint, build, Prisma validate, smoke pass, and screenshot review.
- Policy surface is supported by worktree-only changes, Next.js installed docs review, and explicit routing of product defects to WT-005.

## Recommended Next Route

### Control Signal
- allowed_next_routes: WorktrackScope.Judge, WorktrackScope.Close
- recommended_next_route: WorktrackScope.Close
- approval_required: false
- needs_programmer_approval: false
- why: The runtime smoke suite satisfies the declared test-node acceptance criteria; product issues discovered by screenshots are already within the next planned bugfix worktrack.

### Supporting Detail
- approval_scope: N/A
- approval_reason: N/A

## Follow-up Actions

- Close and merge this worktrack into `develop-aw`, then refresh repo snapshot and milestone progress.
- Carry screenshot-discovered dashboard/list count mismatch and new-ticket priority label issue into `WT-20260522-005-dashboard-ticket-flow-fixes`.
