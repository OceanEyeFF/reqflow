# Worktrack Contract: WT-20260529-093

## Metadata

- worktrack_id: WT-20260529-093
- title: Docs/operator 文档追平
- milestone_id: MS-11
- node_type: docs
- status: active
- branch: worktrack/wt-20260529-093-docs-operator-catch-up
- baseline_branch: develop
- baseline_ref: 7f205b988f0ebe3f2bf81da835196806b1feeef7
- created_by: harness-kernel
- created_at: 2026-05-31

## Task Goal

把 MS-9、MS-10、MS-11 已验证的 PostgreSQL、hybrid retrieval、AI draft context、citation/debug evidence 和 operator 验收事实追平到 README、handoff 与 operator-facing docs，清理仍把 SQLite-only、MS6-only 或未实现 AI 检索路径描述成当前事实的入口文档。

## Scope

### In Scope

- Update current operator entrypoints: `README.md`, `docs/handoff.md`.
- Add or update an operator runbook for hybrid search + AI draft validation.
- Add historical-scope notices to MS6-era AI docs where they can be mistaken for current truth.
- Update cloud/readiness wording where MS-9/MS-10/MS-11 facts supersede older PostgreSQL/pgvector boundary language.
- Record gate evidence and validation commands.

### Out of Scope

- Runtime code changes.
- Database schema or migration changes.
- Provider default changes.
- Production deployment decisions.
- Local CPU embedding sidecar implementation; that remains WT-20260531-100.

## Carrier Decision

- carrier_decision: current-carrier
- decision_inputs: docs-only scope, tight coupling to current Harness control artifacts, low parallelism value, no runtime code edits.
- fallback_reason: SubAgent dispatch is allowed, but not required for this limited documentation catch-up.

## Acceptance Criteria

1. Current docs no longer present SQLite-only retrieval or MS6 static-corpus AI MVP as the active implementation truth.
2. Operator docs describe PostgreSQL readiness, pgvector/native FTS fallback, hybrid retrieval, AI draft citations/debug evidence, and manual confirmation boundary using verified facts.
3. Historical MS6/MS7/MS9 docs remain historically accurate and point to the current operator runbook instead of being silently rewritten.
4. Validation passes for doc syntax/scope checks, lint, tests, build, retrieval evaluation, PostgreSQL readiness, search extension readiness, and diff whitespace.
