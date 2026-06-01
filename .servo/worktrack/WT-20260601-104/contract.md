# Worktrack Contract: WT-20260601-104

## Metadata

- worktrack_id: WT-20260601-104
- title: Provider prompt 升级为业务审查/拷问模式
- milestone_id: MS-12
- node_type: feature
- status: active
- branch: worktrack/wt-20260601-104-business-interrogation-prompt
- baseline_branch: develop
- baseline_ref: 5ad24e8
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

Upgrade clarify-mode provider instructions from generic clarification to coverage-aware business interrogation over process gaps, exception rules, actor boundaries, state flow, failure paths, data rules, acceptance risks, and knowledge conflicts.

## Scope

### In Scope

- Update provider prompt payload/instructions for clarify mode.
- Require structured WT-103 question schema in prompt guidance.
- Use coverage diagnostics as first-class input without exposing raw vector/provider evidence.
- Add tests that assert prompt includes business interrogation categories and schema requirements.

### Out of Scope

- Changing provider adapter transport or model config.
- Changing UI grouping.
- Golden case evaluation implementation.
- Changing retrieval behavior, BM25 runtime, or embedding defaults.

## Acceptance Criteria

1. Clarify prompt asks business interrogation questions, not generic clarification only.
2. Prompt explicitly references coverage gaps, exception rules, actor boundaries, state flow, failure paths, data rules, acceptance risks, and knowledge conflicts.
3. Prompt requires `category`, `priority`, `blocksDraft`, `basis`, `relatedText`, and `expectedAnswerFormat`.
4. Existing provider response normalization and fallback behavior remain compatible.
5. Focused tests, lint, full test, build, and diff check pass.

