# Worktrack Contract: WT-20260529-092

## Metadata

- worktrack_id: WT-20260529-092
- title: PostgreSQL/extension Milestone readiness gate
- milestone_id: MS-11
- node_type: test
- status: completed
- branch: worktrack/wt-20260529-092-postgres-extension-readiness-gate
- created_by: harness-kernel
- created_at: 2026-05-31 23:35:00 +08:00

## Task Goal

为 MS-11 建立最终 PostgreSQL、Prisma migration、pgvector、native FTS fallback、retrieval evaluation 和 AI/debug evidence 的 readiness gate，确认当前本地开发数据库与检索基础设施足以支撑 milestone 级验收。

## Scope

- Run and record PostgreSQL readiness checks against local `reqflow_dev`.
- Run and record search extension readiness checks, including pgvector, native PostgreSQL FTS fallback, and pg_search fallback boundary.
- Run retrieval evaluation corpus gate and focused retrieval/AI evidence tests.
- Produce a readiness report artifact for MS-11 final handback.
- Do not change database schema, migrations, production configuration, or embedding model/provider defaults.

## Acceptance Criteria

1. Prisma schema validates and migration status is up to date against PostgreSQL.
2. pgvector extension is available and vector ordering/index probe passes.
3. native PostgreSQL FTS fallback probe passes.
4. pg_search availability or fallback boundary is explicitly recorded.
5. Retrieval evaluation corpus gate passes.
6. Focused retrieval/AI/debug tests, full test, lint, build, and diff check pass or have explicit blocker evidence.

## Evidence Targets

- `npm run postgres:readiness`
- `npm run search:extensions`
- `npm run retrieval:evaluate`
- focused retrieval/AI/admin debug tests
- `npm run lint`
- `npm run test`
- `npm run build`
- `git diff --check`
