# Worktrack Contract: WT-20260529-069

## Metadata

- worktrack_id: WT-20260529-069
- title: AI 追问逐题回答与草稿优先级修复
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: bugfix
- branch: worktrack/wt-20260529-069-ai-clarification-priority-fix
- baseline_branch: develop
- baseline_commit: 40bdbdc
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Fix fdch0 scenario feedback for MS8 addendum testing: clarification questions must be visible and answerable one by one, and accepting an AI draft must not create an invalid ticket priority payload.

## Scope In

- Restore per-question answer inputs in the AI discussion clarification stage while preserving the fixed three direction labels.
- Send each clarification question with its own answer to the draft API.
- Normalize staged AI draft priority before the new-ticket form consumes it.
- Fix the new-ticket priority select so manual changes submit accepted priority enum values.
- Add focused regression tests for priority normalization.

## Scope Out

- Changing AI provider behavior beyond handoff safety.
- Changing ticket priority enum values or database schema.
- Creating tickets automatically from AI drafts.
- Reopening broader MS8 knowledge-base lifecycle work.

## Acceptance Criteria

1. AI clarification view renders each question with its own answer field.
2. Draft generation sends per-question answers rather than one shared answer for all questions.
3. Staged AI drafts with invalid, uppercase, or display-label priorities prefill a valid API priority.
4. New-ticket priority select submits `low`, `medium`, `high`, or `urgent`.
5. Focused tests, lint, full tests, build, and diff whitespace checks pass.
