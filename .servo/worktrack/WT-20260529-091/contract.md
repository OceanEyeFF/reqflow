# Worktrack Contract: WT-20260529-091

## Metadata

- worktrack_id: WT-20260529-091
- title: 中文业务端到端场景验收
- milestone_id: MS-11
- node_type: test
- status: completed
- branch: worktrack/wt-20260529-091-chinese-business-e2e-validation
- created_by: harness-kernel
- created_at: 2026-05-31 23:23:00 +08:00

## Task Goal

在 WT-089/WT-090 已接入 hybrid context、citation UI 和 admin debug surface 后，建立中文业务端到端验收记录，证明从知识库范围、中文查询、检索证据、AI draft、引用检查到现有工单表单 handoff 的主路径可审查且仍保持人工确认边界。

## Scope

- Add focused automated validation for Chinese AI draft payloads, selected knowledge-base scope, citations, search evidence, and draft handoff formatting.
- Record a manual/operator scenario checklist for upload/parse/index/search/debug/AI draft/ticket handoff that can be executed locally.
- Reuse existing retrieval evaluation/readiness gates where applicable.
- Do not change production provider behavior, do not auto-create tickets, and do not perform WT-092 PostgreSQL readiness milestone gate or WT-093 docs/operator catch-up.

## Acceptance Criteria

1. 中文业务查询 can flow through AI draft generation with selected knowledge-base scope and safe search evidence.
2. Citation provenance includes source id/title/path/section/snippet/freshness for Chinese scenario evidence.
3. Admin debug route evidence is aligned with AI draft evidence for lexical/vector/fusion/context-window inspection.
4. Draft handoff preserves manual confirmation and stages data for the existing ticket form only.
5. Focused tests, retrieval evaluation/readiness where applicable, lint, build, full test, and diff check pass or have explicit not-applicable evidence.

## Evidence Targets

- Focused AI draft/admin debug route tests for Chinese scenario behavior.
- Draft handoff helper tests for citation provenance formatting.
- Retrieval evaluation gate.
- `npm run lint`
- `npm run test`
- `npm run build`
- PostgreSQL readiness where applicable.
