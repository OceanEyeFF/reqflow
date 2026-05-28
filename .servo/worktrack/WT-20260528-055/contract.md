# Worktrack Contract: WT-20260528-055

## Metadata

- worktrack_id: WT-20260528-055
- title: AI 草稿按多知识库范围检索
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-055-ai-module-knowledge-scope
- baseline_branch: develop
- baseline_commit: 521fb354bf00355bb449064e7d408fc9ec63d535
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Make AI draft persisted knowledge retrieval respect selected knowledge base ids.

## In Scope

- Add optional knowledge-base filter to persisted snippet retrieval.
- Pass selected ids from draft-service into knowledge assembly and retrieval.
- Preserve old behavior when no knowledge base is selected.
- Add tests proving selected scope excludes unselected, disabled, and deleted/out-of-range snippets.

## Out Of Scope

- AI page selector UI changes beyond WT-054.
- Language option.
- Multi-draft output.
- Semantic/vector retrieval.

## Acceptance Criteria

1. With selected base ids, persisted snippets are retrieved only from those enabled bases.
2. With no selected base ids, existing global enabled persisted snippets remain eligible.
3. Disabled bases, disabled sources/snippets, failed versions, and deleted sources remain excluded.
4. Draft provider receives knowledge assembled from the selected persisted scope.
