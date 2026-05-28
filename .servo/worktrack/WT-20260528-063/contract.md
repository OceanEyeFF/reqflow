# Worktrack Contract: WT-20260528-063

## Metadata

- worktrack_id: WT-20260528-063
- title: Milestone 收尾 Prisma/数据库必检规则
- milestone_id: none
- derived_from_milestone: false
- node_type: governance
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-063-milestone-db-gate-policy
- baseline_branch: develop
- baseline_commit: 9f85486
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: policy + validation
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Promote Prisma/client/database readiness from a one-off MS8 check into a standing milestone handback rule: before any milestone is delivered to fdch0 for final acceptance, the active checkout and active database must pass the required Prisma/database checks, or the gate must explicitly record why the check is not applicable.

## In Scope

- Update repo-level system invariants.
- Update worktrack/gate templates so final validation worktracks include the database readiness lane.
- Register the governance rule in repo backlog/control state.
- Preserve WT-20260528-062 as the immediate MS8 application of the rule.

## Out Of Scope

- Running WT-20260528-062 checks in this policy worktrack.
- Changing Prisma schema, migrations, package files, or application runtime behavior.
- Marking MS8 accepted.

## Acceptance Criteria

1. Goal/system invariants require milestone-final handback to include Prisma Client, `DATABASE_URL`, `prisma validate`, `prisma migrate status`, and active DB schema readiness checks when the repo uses Prisma.
2. Worktrack templates expose the milestone-final database readiness lane.
3. Gate evidence template requires recording non-destructive migration-history repair steps if used.
4. Control state notes that WT-062 remains the current MS8 execution of the standing rule.
