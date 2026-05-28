# Worktrack Contract: WT-20260528-054

## Metadata

- worktrack_id: WT-20260528-054
- title: AI 对话页面知识库多选入口
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-054-module-scope-switching
- baseline_branch: develop
- baseline_commit: 8b8a06fffc9af0ad8f020e09b402c2832cc1349f
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Expose a user-facing knowledge-base multi-select entry on the AI discussion page and carry selected knowledge base ids through the draft request boundary.

## In Scope

- Authenticated read-only knowledge-base list API for AI discussion users.
- AI discussion page multi-select UI for enabled knowledge bases.
- Draft request parsing accepts and sanitizes `knowledgeBaseIds`.
- Provider request type carries `knowledgeBaseIds` for WT-055 to consume.

## Out Of Scope

- Filtering retrieval by selected knowledge bases.
- Auto-selecting knowledge bases by content.
- Admin knowledge-base CRUD changes.
- Language option or multi-draft output.

## Acceptance Criteria

1. Authenticated users can load enabled knowledge bases for the AI discussion page.
2. Unauthenticated users cannot load the user-facing knowledge-base list.
3. AI discussion requests include selected knowledge base ids.
4. Draft request parsing validates `knowledgeBaseIds` without changing retrieval behavior yet.
5. Existing AI draft flow remains compatible when no knowledge base is selected.
