# Worktrack Contract: WT-20260528-062

## Metadata

- worktrack_id: WT-20260528-062
- title: Prisma 与数据库验收必检项
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: test
- status: planned
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-062-prisma-db-acceptance-check
- baseline_branch: develop
- baseline_commit: 8e18066
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: validation + operator-db-readiness
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Make Prisma client health, migration history, and the active local database schema a mandatory acceptance check before MS8 can be finally accepted.

## In Scope

- Verify dependency installation and generated Prisma Client availability.
- Verify `DATABASE_URL` is present and points at the intended local development database.
- Run `npx prisma validate`.
- Run `npx prisma migrate status --schema prisma/schema.prisma`.
- If migration history is drifted but tables already exist, record the exact non-destructive recovery steps and resulting status.
- Verify key MS8 tables and fields exist in the active database.
- Verify admin knowledge-base API no longer fails due to schema drift.

## Out Of Scope

- Deleting or resetting the active database.
- Changing Prisma schema or migrations unless validation finds a real tracked schema defect.
- Seeding, clearing, or destructively modifying production-like data.
- Marking MS8 accepted; fdch0 retains final milestone acceptance.

## Acceptance Criteria

1. `@prisma/client` is installed and generated in the active checkout.
2. `npx prisma validate` passes with the active `DATABASE_URL`.
3. `npx prisma migrate status` reports the active database schema is up to date.
4. The active database contains MS8-required `KnowledgeBase`, `KnowledgeSource.knowledgeBaseId`, source/version/snippet, and provider config schema surfaces.
5. Admin knowledge-base API responds without a schema-related server error after login/session context is valid.
6. Gate evidence explicitly records any local migration-history repair steps used during validation.
