# Worktrack Contract: WT-20260528-058

## Metadata

- worktrack_id: WT-20260528-058
- title: AI 草稿回答语言选项
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-058-ai-draft-language-option
- baseline_branch: develop
- baseline_commit: 1cd525fba7f8d7dbfc2bbfd3da577f351079ac16
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Add AI draft answer language modes: follow input, Chinese, and English, without changing the draft schema.

## In Scope

- Add request/provider type field for answer language.
- Parse and default answer language safely.
- Add AI discussion UI segmented control.
- Pass explicit language instruction to Deepseek provider payload.

## Out Of Scope

- Multi-draft/splitting.
- Translation post-processing.
- Schema changes to generated draft shape.

## Acceptance Criteria

1. UI offers `跟随输入 / 中文 / English`.
2. Request defaults to follow input if omitted or invalid.
3. Provider receives language mode and prompt payload includes the language instruction.
4. Existing draft schema and handoff behavior are unchanged.
