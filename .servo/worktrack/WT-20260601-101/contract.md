# Worktrack Contract: WT-20260601-101

## Metadata

- worktrack_id: WT-20260601-101
- title: 检索覆盖诊断与追问 evidence 结构
- milestone_id: MS-12
- derived_from_milestone: true
- node_type: feature
- status: active
- branch: worktrack/wt-20260601-101-coverage-diagnostics
- baseline_branch: develop
- baseline_ref: 9c9fe97
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

为 AI clarify mode 增加安全的检索覆盖诊断结构，使 provider 在生成追问前能看到 matched/missing core terms、citation count、vector lane status、selected knowledge-base scope 和 lexical engine evidence，并让 API 返回的 searchEvidence 暴露同一份安全 coverage 摘要。

## Worktrack Intake Review

- repo_fundamentals: MS-12 is active in the main checkout control state; WT-20260601-101 is the first planned MS-12 worktrack.
- snapshot_freshness: repo snapshot is stale versus current HEAD, but WT-101 has a narrow feature scope and will refresh closeout evidence after validation.
- milestone_purpose_alignment: directly serves MS-12 completion signals 1, 2, and 4 by exposing coverage weakness before business interrogation prompt/schema/UI follow-ups.
- historical_conflict_risk: preserve AI manual confirmation boundary, bounded provider context, and no provider secret exposure.
- worktrack_adjustment_recommendations: keep as first slice; do not combine with schema category upgrade, prompt rewrite, or UI grouping.
- add_remove_worktrack_recommendations: none
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Add a typed safe coverage diagnostics object derived from existing retrieval debug evidence.
- Include coverage diagnostics in `searchEvidence` returned by `/api/ai/draft`.
- Include coverage diagnostics in provider request payloads, especially clarify mode.
- Add focused tests for matched/missing terms, selected knowledge-base scope, vector lane status, lexical engine evidence, and secret redaction.

### Out of Scope

- Changing question category schema, priority, `blocksDraft`, basis, or expected answer format.
- Changing provider prompt wording to full business interrogation mode.
- Changing AI discussion UI grouping or answer interaction.
- Enabling BM25/pg_search as runtime default.
- Enabling local embedding sidecar as default or rebuilding embeddings.

## Carrier Decision

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: small cross-cutting type/service/provider/test change; high coupling to existing route tests; no disjoint write set worth parallel implementation.
- delegation_attempted: explorer only for read-only code location; implementation stays current-carrier.
- fallback_reason: current-carrier chosen by dispatch policy for tight integration and low parallel value.

## Acceptance Criteria

1. Clarify provider requests include safe coverage diagnostics with selected knowledge-base scope, citation count, matched/missing core terms, vector lane status, and lexical engine evidence.
2. API `searchEvidence` includes the same safe coverage diagnostics and does not expose vector provider evidence, API keys, raw secrets, disabled knowledge content, or unauthorized source data.
3. Empty or weak retrieval produces explicit coverage gaps instead of pretending knowledge coverage exists.
4. Existing draft behavior, citations, and manual ticket confirmation boundary remain unchanged.
5. Focused tests, lint, build, and diff check pass or have explicit evidence.
