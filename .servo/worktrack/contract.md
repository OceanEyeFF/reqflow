---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-005-dashboard-ticket-flow-fixes"
milestone_id: "MS-20260522-002"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-005-dashboard-ticket-flow-fixes
- branch: worktrack/WT-20260522-005-dashboard-ticket-flow-fixes
- baseline_branch: develop-aw
- baseline_ref: e2a33a1142d3bf72e6536bb67ca3a280504b451a
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: initialized

## Node Type

- type: bugfix
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-bugfix-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-002`; `WT-20260522-004` is closed and merged; baseline branch is `develop-aw`.
- snapshot_freshness: fresh at `e2a33a1`; repo snapshot and analysis route smoke-discovered defects to this worktrack.
- milestone_purpose_alignment: directly satisfies the milestone purpose to fix the first layer of blocking UX/runtime defects found by smoke checks.
- historical_conflict_risk: medium because fixes touch dashboard/ticket client data flow and API filtering semantics; keep changes behavior-preserving and targeted.
- worktrack_adjustment_recommendations: keep as one bugfix slice focused on dashboard scope count/list consistency and new-ticket priority label display.
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

- Fix smoke-discovered dashboard/ticket flow defects without adding new product features.

## Scope

### Control Signal
- Scope summary: Repair dashboard list/stat scope consistency and user-facing priority label display in ticket form/list flows.

### Supporting Detail
- In scope: dashboard tab/list consistency for assigned/created/involved scopes; ticket API scope filtering if it is the root cause; new-ticket priority select display labels; regression coverage in existing Playwright smoke.
- Out of scope: collaboration feature expansion, notification/attachment UX, production storage/database strategy, broad visual redesign, unrelated admin/search/reporting features.

## Non-Goals

- Do not add new dashboard concepts beyond existing tabs/cards.
- Do not redesign the page layout.
- Do not mutate Prisma schema, migrations, or committed database binaries.
- Do not broaden smoke beyond current milestone flow unless needed to prove these fixes.

## Impacted Modules

- `src/app/(dashboard)/page.tsx`
- `src/app/(dashboard)/tickets/new/page.tsx`
- `src/app/api/tickets/route.ts`
- `src/app/api/tickets/stats/route.ts`
- `tests/smoke/core-workflow.spec.ts`
- `docs/handoff.md` only if verified behavior notes change
- `.servo/worktrack/*`

## Planned Next State

- Dashboard selected tab title/count and ticket list agree with the active scope.
- New-ticket priority select shows user-facing labels, not internal enum keys.
- Runtime smoke still passes and includes assertions guarding these fixes.

## Acceptance Criteria

### Control Signal
- Core acceptance: smoke no longer reveals dashboard/list count mismatch or priority label leakage.

### Supporting Detail
- `admin` login dashboard default "待我处理" list matches assigned count.
- Switching to "我发起的" shows the sample ticket and count consistently.
- `/tickets/new` priority select displays Chinese labels for low/medium/high/urgent while preserving submitted values.
- `npm run lint`, `npm run build`, `npm run db:validate`, and `npm run smoke` pass.
- Screenshots after smoke show fixed dashboard and new-ticket surfaces.

## Constraints

### Control Signal
- Key constraint: targeted bugfix only.

### Supporting Detail
- Next.js installed docs have been read for Client Components, data fetching, and route handlers before code changes.
- Use worktree-only changes on `worktrack/WT-20260522-005-dashboard-ticket-flow-fixes`.
- Keep seed data and database binaries unchanged.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- `npm run smoke`
- Screenshot sanity check for dashboard and new-ticket form
- `git diff --check`

## Rollback Conditions

### Control Signal
- Roll back if fixes require schema changes, feature expansion, or broad UI redesign.

### Supporting Detail
- Revert the worktrack branch and return to RepoScope.Decide with a narrower bugfix target.

## Notes

- Second worktrack under `MS-20260522-002`.
