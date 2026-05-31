# Worktrack Contract: WT-20260531-095

## Metadata

- worktrack_id: WT-20260531-095
- title: MS-9 grill-me 反向拷打验收
- milestone_id: MS-9
- node_type: review
- status: active
- created_at: 2026-05-31
- created_by: harness-kernel

## Task Goal

Run a final adversarial acceptance conversation for MS-9 using the thinking style from `https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md`: inspect repo evidence first, then ask fdch0 only one pointed question at a time, including a recommended answer.

## Scope

In scope:

- Gather MS-9 evidence that can be answered from the repository.
- Identify only decisions that require fdch0's judgment.
- Ask one question at a time.
- Record fdch0's answer, recommended answer, and impact on MS-9 acceptance.

Out of scope:

- Marking MS-9 accepted.
- Activating MS-10.
- Re-asking questions already answered by repo artifacts.
- Asking multiple questions in one turn.

## Baseline And Branch Policy

- baseline_branch: develop
- baseline_ref: f3947e6b77ec0fed42581e393a42115ea92f6c09
- branch: worktrack/wt-20260531-095-ms9-grill-me-acceptance
- baseline_form: commit-on-review-branch
- merge_required: true
- if_interrupted_strategy: keep branch and preserve recorded question state

## Acceptance Criteria

- Repo-answerable MS-9 facts are recorded in gate evidence.
- At least one fdch0-only decision question is asked using one-question-at-a-time style.
- The question includes a recommended answer.
- fdch0's answer is recorded before final WT-095 pass.
- Any acceptance blocker revealed by the answer is recorded as a follow-up worktrack or handback blocker.
