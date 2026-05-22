---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260522-001-validation-environment-baseline"
milestone_id: "MS-20260522-001"
derived_from_milestone: "true"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260522-001-validation-environment-baseline
- branch: worktrack/WT-20260522-001-validation-environment-baseline
- baseline_branch: develop-aw
- baseline_ref: a8e7b86
- owner: servo-kernel
- updated: 2026-05-22
- contract_status: active

## Node Type

- type: config
- source_from_goal_charter: `.servo/goal-charter.md#Engineering Node Map`
- baseline_form: commit-on-config-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Worktrack Intake Review

- worktrack_intake_review: ready
- repo_fundamentals: active milestone `MS-20260522-001`; baseline branch `develop-aw`; no closed worktracks yet; no release/package/deploy work is authorized in this slice.
- snapshot_freshness: fresh enough for initialization; milestone and backlog were created at `a8e7b86`; validation evidence from RepoScope.Observe shows lint/build/prisma command gaps.
- milestone_purpose_alignment: this worktrack directly supports the milestone completion signal that validation commands must be runnable and interpretable before trusting the MiniMax-initialized baseline.
- historical_conflict_risk: low for scope if limited to validation prerequisites and documentation of command environment; risk becomes high if it changes product behavior or attempts broad lint fixes.
- worktrack_adjustment_recommendations: keep as first worktrack; do not combine with lint-quality fixes except where command execution prerequisites require it.
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

- Make the `develop-aw` worktree validation environment explicit and reproducible enough that `npm run lint`, `npm run build`, and Prisma validation failures can be interpreted as code findings rather than accidental local environment gaps.

## Scope

### Control Signal
- 范围摘要（一句话）：Establish validation command prerequisites and baseline environment documentation for the Harness worktree.

### Supporting Detail
- 详细范围项：
  - Investigate why `npm run build` in the worktree resolves workspace root/dependencies incorrectly.
  - Provide a committed, non-secret env example or validation note for Prisma `DATABASE_URL`.
  - Document exact local setup steps needed before validation commands are meaningful.
  - Adjust repository configuration only if needed to make validation run from the worktree without relying on the main checkout.
  - Re-run lint/build/prisma validation and record results for downstream worktracks.

## Non-Goals

- Do not fix general lint errors unless required to prove validation command execution.
- Do not add new product features.
- Do not change authentication, ticket, notification, attachment, or database business behavior.
- Do not migrate SQLite to another database.
- Do not commit secrets or local `.env` files.

## Impacted Modules

- `next.config.ts`
- `package.json` / lockfile only if validation command semantics require it
- `.env.example` or equivalent non-secret operator guidance if added
- `README.md` / `docs/handoff.md` only for validation environment notes that are prerequisites for later docs catch-up
- `.servo/worktrack/*` evidence files

## Planned Next State

- Validation prerequisites are explicit.
- Worktree build behavior no longer fails solely because dependencies/root are resolved from the wrong checkout, or the remaining limitation is documented as an intentional local setup requirement.
- Prisma validation can be run with a documented non-secret SQLite `DATABASE_URL`.
- Downstream `lint-quality-baseline` can treat lint errors as real code quality findings.

## Acceptance Criteria

### Control Signal
- 核心验收项：Validation command environment is reproducible and command outcomes are attributable.

### Supporting Detail
- 完整验收标准：
  - `npm run lint` is runnable in the worktrack worktree; current output is captured.
  - `npm run build` is runnable after documented setup, or any remaining failure is classified with evidence and not caused by missing untracked dependencies.
  - `npx prisma validate` is runnable with documented `DATABASE_URL` setup or a committed non-secret example.
  - No secret file is committed.
  - Any config changes are minimal and do not alter product behavior.

## Constraints

### Control Signal
- 关键约束：Stay inside validation environment baseline scope; do not absorb lint remediation or product work.

### Supporting Detail
- 详细约束条件：
  - Follow `AGENTS.md` worktree discipline.
  - For Next.js behavior/config changes, inspect installed docs under `node_modules/next/dist/docs/` first.
  - Prefer documentation and setup clarity over broad application refactors.
  - Treat MiniMax-generated code as untrusted until validation evidence supports it.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `npx prisma validate` with documented `DATABASE_URL`
- `git status --short --branch`
- Review diff to confirm no product behavior changes outside scope

## Rollback Conditions

### Control Signal
- 回滚触发条件：Any config/doc/setup change broadens product behavior or hides real validation failures.

### Supporting Detail
- 回滚步骤与回退路径：Revert this worktrack branch changes before merge; keep `develop-aw` milestone active and return to RepoScope.Decide for a narrower plan.

## Notes

- This is the first worktrack under `MS-20260522-001`.
