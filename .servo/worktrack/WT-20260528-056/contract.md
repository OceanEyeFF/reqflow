# Worktrack Contract: WT-20260528-056

## Metadata

- worktrack_id: WT-20260528-056
- title: MS8 集成验收与迁移回归
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-056-ms8-validation
- baseline_branch: develop
- baseline_commit: 875fff1
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: validation + policy + milestone-readiness
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Collect strict MS8 integration and regression evidence after all MS8 feature worktracks have merged, adding only narrowly scoped fixes or tests if validation exposes a concrete gap.

## In Scope

- Verify MS8 completion signals and acceptance criteria against current implementation.
- Run migration/schema, lint, test, and build validation.
- Inspect cross-feature behavior for knowledge base selection, selected deletion, scoped retrieval, language mode, and multi-draft handoff.
- Record any manual acceptance boundary or residual operator-run checks.

## Out Of Scope

- New feature behavior beyond MS8 acceptance.
- Docs path reorganization; this remains deferred to MS-20260528-002.
- Dangerous data deletion or production environment mutation.
- Marking the milestone finally accepted; fdch0 retains that decision.

## Acceptance Criteria

1. Existing automated tests for MS7/MS8 knowledge and AI surfaces pass.
2. Prisma schema/migration state is validated without data-destructive operations.
3. `npm run lint`, `npm run test`, and `npm run build` pass, or gate evidence records equivalent reasons.
4. Gate evidence maps all MS8 milestone acceptance criteria to implementation/test evidence or a clear manual acceptance note.
5. No scope creep into docs cleanup, vector search, batch AI approval, or broad destructive cleanup is introduced.
