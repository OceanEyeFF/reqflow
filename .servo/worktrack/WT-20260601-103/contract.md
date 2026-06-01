# Worktrack Contract: WT-20260601-103

## Metadata

- worktrack_id: WT-20260601-103
- title: Clarify question schema 升级
- milestone_id: MS-12
- node_type: feature
- status: active
- branch: worktrack/wt-20260601-103-clarify-question-schema
- baseline_branch: develop
- baseline_ref: aca97b0
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

Extend AI clarification questions from plain `question/reason` records into a structured schema that can carry business category, priority, draft-blocking status, basis, related text, and expected answer format while preserving compatibility with existing provider responses and UI rendering.

## Scope

### In Scope

- Add typed clarification question fields: `category`, `priority`, `blocksDraft`, `basis`, `relatedText`, and `expectedAnswerFormat`.
- Normalize provider responses so missing fields receive conservative defaults.
- Ensure fallback questions also use the new schema.
- Add focused tests for nested provider responses, fallback questions, schema normalization, caps, and API/provider request compatibility.

### Out of Scope

- Full business interrogation prompt rewrite.
- Frontend grouped display changes.
- Golden case evaluation.
- Changing the manual confirmation boundary or direct ticket creation behavior.

## Acceptance Criteria

1. `AiClarificationQuestion` includes the structured schema fields required by MS-12.
2. Provider-normalized clarification output always contains valid schema fields.
3. Legacy provider output with only `question` and `reason` remains accepted.
4. Tests cover category, priority, `blocksDraft`, basis, related text, expected answer format, and fallback behavior.
5. Focused tests, lint, full test, build, and diff check pass.

