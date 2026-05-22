---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-004-runtime-smoke-suite"
milestone_id: "MS-20260522-002"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-004-runtime-smoke-suite
- branch: worktrack/WT-20260522-004-runtime-smoke-suite
- baseline_branch: develop-aw
- baseline_ref: 80621eabd29e5d6232fa6f9db461ed0c1d036449
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: initialized

## Node Type

- type: test
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-002`; previous milestone `MS-20260522-001` is completed; baseline branch is `develop-aw`; this slice is validation hardening only.
- snapshot_freshness: control state and milestone backlog point to `MS-20260522-002`; repo snapshot checkpoint lags the milestone planning commit, but product code has not changed since runtime dashboard hotfix. Refresh must occur after closeout.
- milestone_purpose_alignment: directly satisfies the milestone signal requiring a repeatable browser-level smoke command or documented Playwright flow for authenticated entry and core ticket navigation.
- historical_conflict_risk: medium because runtime smoke can expose product defects; this worktrack may document blockers but must not absorb bug fixes beyond smoke harness/setup.
- worktrack_adjustment_recommendations: keep as a single test slice; route discovered runtime defects to `WT-20260522-005-dashboard-ticket-flow-fixes`.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Execution Policy

- execution_policy_contract_ref: docs/harness/artifact/worktrack/contract.md#execution-policy
- runtime_dispatch_mode: auto
- dispatch_mode_source: worktrack-contract
- allowed_values: auto / delegated / current-carrier
- fallback_reason_required: yes

## Task Goal

- Add a minimal repeatable runtime smoke suite for the local authenticated ReqFlow workflow.

## Scope

### Control Signal
- Scope summary: Add Playwright-based local smoke coverage for login, dashboard entry, core ticket navigation, new-ticket reachability, tab switching, and logout.

### Supporting Detail
- In scope: install-free or locally compatible Playwright smoke script/test, screenshots or traces where practical, seed-user login path, protected `/` behavior, dashboard load, tickets list, ticket detail navigation, new-ticket form reachability, dashboard tab switching, logout, npm script/docs needed to run the smoke.
- Out of scope: product feature changes, broad visual redesign, production deployment strategy, collaboration feature expansion, and bug fixes not required to make the smoke harness itself run.

## Non-Goals

- Do not fix dashboard/ticket runtime defects discovered by smoke unless the defect is solely in the new smoke test code.
- Do not mutate database schema or committed database binaries.
- Do not introduce new authentication modes or seed credentials.
- Do not claim full end-to-end production readiness.

## Impacted Modules

- `package.json`
- `package-lock.json` if a smoke dependency is added
- Playwright smoke files under a focused test path
- `docs/handoff.md` or README only for smoke command documentation
- `.servo/worktrack/*`

## Planned Next State

- A repeatable command exists for the local smoke workflow.
- Browser-level evidence covers authenticated entry and core ticket navigation.
- Any runtime product blockers are recorded for `WT-20260522-005-dashboard-ticket-flow-fixes` instead of being silently fixed in this worktrack.

## Acceptance Criteria

### Control Signal
- Core acceptance: local runtime smoke coverage is repeatable and produces browser-level evidence for the authenticated core workflow.

### Supporting Detail
- Smoke can log in with a documented seed account.
- Smoke reaches the authenticated dashboard from `/`.
- Smoke exercises dashboard tab switching, ticket list, ticket detail navigation, new-ticket form reachability, and logout where the current app permits.
- `npm run lint`, `npm run build`, and `npm run db:validate` remain passing.
- If runtime blockers are found, they are documented with screenshots/logs and routed to `WT-20260522-005` without broadening this worktrack.

## Constraints

### Control Signal
- Key constraint: validation hardening only; no product fixes except smoke harness corrections.

### Supporting Detail
- Read installed Next.js docs before touching Next.js app code.
- Use worktree-only changes on `worktrack/WT-20260522-004-runtime-smoke-suite`.
- Keep browser smoke deterministic for local SQLite/seed credentials.
- Avoid destructive cleanup of local uploads or database files.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `npm run db:validate`
- Runtime smoke command or documented Playwright execution
- Screenshots for at least dashboard and one ticket-flow surface when smoke reaches them
- `git diff --stat`

## Rollback Conditions

### Control Signal
- Roll back if smoke setup requires broad product rewrites, unsafe database mutation, or unapproved scope expansion.

### Supporting Detail
- Preserve evidence of discovered runtime blockers, revert smoke harness changes if they destabilize the build, and return to RepoScope.Decide or `WT-20260522-005` for fixes.

## Notes

- First worktrack under `MS-20260522-002`.
