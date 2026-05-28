# Worktrack Contract: WT-20260528-059

## Metadata

- worktrack_id: WT-20260528-059
- title: AI 多套/拆分需求草稿
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-059-ai-multi-draft-splitting
- baseline_branch: develop
- baseline_commit: 90000e1
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Allow AI draft generation to return up to 3 candidate drafts when the input naturally splits into separate requirements, while preserving the existing single-draft response and one-selected-draft handoff.

## In Scope

- Add a configurable capped `maxDrafts` provider request value.
- Extend AI draft result typing with a compatible multi-draft response.
- Normalize Deepseek single and multi-draft JSON responses.
- Render multiple candidate drafts on the AI discussion page.
- Allow selecting exactly one candidate for the existing ticket creation handoff.

## Out Of Scope

- Batch ticket creation or approving multiple drafts at once.
- Changing the staged draft schema used by the ticket form.
- Automatic context routing, vector retrieval, or provider redesign.
- Raising the default cap above 3.

## Acceptance Criteria

1. Single draft responses remain accepted as `kind: "draft"` and use the same handoff schema.
2. Multi-draft responses are accepted as `kind: "drafts"` and capped by the configured max, defaulting to 3.
3. The provider prompt payload includes the max draft limit and split-draft instruction.
4. The AI discussion UI can display multiple candidates and stage only the selected single draft.
5. Tests cover parser/service max draft propagation, provider normalization, and API route pass-through.
