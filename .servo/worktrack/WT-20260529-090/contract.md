# Worktrack Contract: WT-20260529-090

## Metadata

- worktrack_id: WT-20260529-090
- title: Citation UI、检索证据与 Admin Debug 展示追平
- milestone_id: MS-11
- node_type: feature
- status: completed
- branch: worktrack/wt-20260529-090-citation-ui-search-evidence
- created_by: harness-kernel
- created_at: 2026-05-31 22:50:53 +08:00

## Task Goal

在 WT-089 已将 AI draft 接入 hybrid context 的基础上，补齐可审查 citation UI、检索证据返回和 admin/debug inspection surface，使操作者能够看到 lexical/vector/fusion/context-window/citation 聚合证据，同时不泄露 provider secret 或未授权知识内容。

## Scope

- Extend AI draft response with safe search evidence/debug metadata from hybrid context.
- Render citation provenance and search evidence in the AI discussion page.
- Add an admin-only knowledge search/debug API and UI surface for inspecting retrieval evidence.
- Preserve manual draft confirmation boundary; do not create tickets automatically.
- Do not perform WT-091 Chinese E2E manual scenario, WT-092 milestone readiness gate, WT-093 docs catch-up, or WT-100 local embedding sidecar PoC.

## Acceptance Criteria

1. Citation UI shows real source id/title/path/section/snippet provenance.
2. AI draft response includes safe evidence for lexical hits, vector lane, fused hits, context window, filter scope, and citation grouping.
3. Admin debug surface can run a query against selected knowledge bases and inspect evidence without changing AI draft output.
4. Disabled/unauthorized knowledge and provider secrets are not exposed by the debug surface.
5. Focused API/UI tests and repo validation pass.

## Evidence Targets

- AI draft route/provider focused tests.
- Knowledge retrieval/admin debug route tests.
- AI discussion/client UI tests if existing infrastructure supports them; otherwise focused type/build coverage.
- `npm run lint`
- `npm run test`
- `npm run build`
- PostgreSQL readiness where applicable.
