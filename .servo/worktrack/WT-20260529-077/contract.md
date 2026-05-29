# Worktrack Contract: WT-20260529-077

## Metadata

- worktrack_id: WT-20260529-077
- title: AI 追问可见性与空追问兜底修复
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: bugfix
- branch: worktrack/wt-20260529-077-ai-clarification-visible
- baseline_branch: develop
- baseline_commit: 0c256ef
- baseline_form: commit-on-bugfix-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Task Goal

Fix fdch0 MS8 addendum acceptance feedback that AI clarification questions are still hard to see or absent in the UI after a successful clarify request.

## Scope In

- Reproduce the issue with the provided “一般耗材标准检验出库” prompt and all knowledge bases selected.
- Ensure clarify responses always produce visible clarification output, even when the provider returns empty direction question arrays.
- Improve the AI discussion page so the clarification stage has an obvious status/answer area and selected knowledge-base count.
- Preserve fixed direction labels, per-question answers, draft handoff, and human-confirmation boundary.
- Add focused tests for empty clarification fallback.

## Scope Out

- Changing retrieval quality or semantic matching; that is planned under MS-20260529-001.
- Changing provider configuration or introducing new AI providers.
- Changing ticket creation behavior or auto-creating tickets from AI output.
- Redesigning the whole AI discussion page.

## Acceptance Criteria

1. A successful clarify request with empty provider questions still renders visible questions under “AI 追问”.
2. The page makes it obvious that the AI clarification stage has returned and where to answer each question.
3. Knowledge-base selection state is visible enough for manual testing with “all knowledge bases”.
4. Focused provider/API tests cover empty clarification fallback.
5. Lint, focused tests, full tests, build, and Playwright screenshot evidence pass.
