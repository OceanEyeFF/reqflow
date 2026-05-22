---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-003-docs-handoff-catch-up"
milestone_id: "MS-20260522-001"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-003-docs-handoff-catch-up
- branch: worktrack/WT-20260522-003-docs-handoff-catch-up
- baseline_branch: develop-aw
- baseline_ref: b62e4b0
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: ready_for_close

## Node Type

- type: docs
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-001`; WT1 and WT2 are merged into `develop-aw`; no feature scope authorized.
- snapshot_freshness: fresh at `b62e4b0`; repo snapshot identifies `docs/handoff.md` as stale.
- milestone_purpose_alignment: directly satisfies milestone signal that operator-facing docs must not contradict the verified Harness baseline.
- historical_conflict_risk: low because scope is documentation-only; risk rises if docs claim unverified product readiness or introduce new roadmap commitments.
- worktrack_adjustment_recommendations: keep as a single docs catch-up slice focused on handoff and validation facts.
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

- Align operator-facing handoff documentation with verified code, `develop-aw` governance, and current validation commands.

## Scope

### Control Signal
- 范围摘要（一句话）：Refresh stale handoff documentation using only verified baseline facts.

### Supporting Detail
- 详细范围项：`docs/handoff.md`, and README only if a verified fact gap is discovered there.

## Non-Goals

- No product code changes.
- No new feature planning or priority reshuffle beyond removing stale phase claims.
- No database schema changes.
- No broad documentation rewrite outside the operator-facing handoff surface.

## Impacted Modules

- `docs/handoff.md`
- `.servo/worktrack/*`

## Planned Next State

- Handoff docs name `develop-aw` as the Harness-managed baseline.
- Handoff docs list the current verified routes, models, validation commands, and known risks.
- Old claims that attachments/notifications are future-only are removed or corrected.

## Acceptance Criteria

### Control Signal
- 核心验收项：operator-facing docs no longer contradict the verified baseline.

### Supporting Detail
- 完整验收标准：Docs cite current validation commands; branch/worktree workflow matches Harness governance; route/model inventory includes notifications and attachments; no unverified production-readiness claims are added.

## Constraints

### Control Signal
- 关键约束：Docs-only catch-up from verified facts.

### Supporting Detail
- 详细约束条件：Do not modify implementation; do not mark the milestone complete until docs pass validation and repo refresh.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `npm run db:validate`
- `git diff --stat`
- targeted text search for stale `develop`, `Phase 7`, `Phase 8`, and validation claims in docs.

## Rollback Conditions

### Control Signal
- 回滚触发条件：Docs require unverified implementation claims or scope expands into product work.

### Supporting Detail
- 回滚步骤与回退路径：Revert the docs worktrack branch and return to RepoScope.Decide with a narrower docs target.

## Notes

- Third worktrack under `MS-20260522-001`.
