# Worktrack Contract: WT-20260601-105

## Metadata

- worktrack_id: WT-20260601-105
- title: AI 追问前端分组展示与回答交互改造
- milestone_id: MS-12
- node_type: feature
- status: active
- branch: worktrack/wt-20260601-105-clarify-ui-grouping
- baseline_branch: develop
- baseline_ref: 7cdbdc1
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

Expose the WT-103 clarification schema in the AI discussion UI by grouping blocking questions, recommended questions, and knowledge-base gaps while preserving per-question answers across regeneration.

## Scope

### In Scope

- Group clarification questions by business impact.
- Show category, priority, blocking status, basis, related text, and expected answer format.
- Preserve existing per-question answer state and manual draft confirmation boundary.
- Keep the current draft generation API contract.

### Out of Scope

- Golden case evaluation.
- Provider prompt changes.
- Retrieval/indexing behavior.
- Creating tickets automatically.

## Acceptance Criteria

1. Blocking questions and knowledge-base gaps are visibly separated from recommended questions.
2. Schema metadata is visible without hiding the existing direction labels.
3. Existing per-question answer preservation still works.
4. Lint, focused tests, full test, build, and diff check pass.

