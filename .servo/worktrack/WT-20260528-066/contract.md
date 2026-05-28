# Worktrack Contract: WT-20260528-066

## Metadata

- worktrack_id: WT-20260528-066
- title: MS8 addendum 集成验收
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: test
- branch: worktrack/wt-20260528-066-ms8-addendum-validation
- baseline_branch: develop
- baseline_commit: 1981224a1669f99d24b05b15ad60b08a59bcaa04
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: active milestone is MS-20260528-003; WT-20260528-064 and WT-20260528-065 are completed and merged.
- snapshot_freshness: repo refresh after WT-065 updated snapshot, backlog, milestone progress, and control-state at `1981224a1669f99d24b05b15ad60b08a59bcaa04`.
- milestone_purpose_alignment: WT-066 validates the full MS8 addendum against its completion signals and acceptance criteria.
- historical_conflict_risk: medium-low; validation must include DB readiness and manual UI flow record because these are explicit acceptance requirements.
- worktrack_adjustment_recommendations: keep as validation-only worktrack unless a low-risk blocker is found.
- add_remove_worktrack_recommendations: none unless validation exposes an unhandled acceptance gap.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Collect integrated validation evidence for MS8 addendum and prepare the milestone handback package without performing final programmer acceptance.

## Scope In

- Run lint, full tests, and build on the merged MS8 addendum baseline.
- Run Prisma/DB readiness checks against the active checkout and active `DATABASE_URL`.
- Verify MS8 addendum acceptance criteria by cross-referencing WT-064 and WT-065 gate evidence.
- Add a manual UI flow record template/report for final operator review.
- Produce milestone-level validation evidence and final handback notes.

## Scope Out

- User final acceptance of the milestone.
- Destructive database reset, production migration, or provider live API calls.
- Large UX redesign or new feature scope beyond validation blockers.

## Acceptance Criteria

1. `npm run lint`, `npm run test`, and `npm run build` pass.
2. `npx prisma validate` passes.
3. `npx prisma migrate status --schema prisma/schema.prisma` reports the database schema is up to date, or any environment-specific limitation is explicitly recorded.
4. Active database schema surface confirms MS8 addendum tables/fields required by knowledge-base lifecycle and AI draft APIs.
5. Manual UI flow record exists and covers admin knowledge-base lifecycle, disabled/archive protections, AI multi-direction clarification, unified answer area, and single draft handoff.
6. Gate evidence clearly states milestone final acceptance remains fdch0-only.

## Rollback Conditions

- Validation reveals a functional blocker that cannot be fixed within the existing approved scope.
- DB readiness cannot be assessed with enough confidence.
- Manual UI flow cannot be represented for operator execution.
