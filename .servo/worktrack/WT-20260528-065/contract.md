# Worktrack Contract: WT-20260528-065

## Metadata

- worktrack_id: WT-20260528-065
- title: AI 多方向追问策略
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: feature
- branch: worktrack/wt-20260528-065-ai-clarification-directions
- baseline_branch: develop
- baseline_commit: 3e356ad193472cfecf99a5735a503da3deb1fe46
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: active milestone is MS-20260528-003; WT-20260528-064 is completed and merged; develop baseline is refreshed at `3e356ad193472cfecf99a5735a503da3deb1fe46`.
- snapshot_freshness: `.servo/control-state.md`, `.servo/repo/worktrack-backlog.md`, `.servo/repo/milestone-backlog.md`, `.servo/milestone/MS-20260528-003.md`, and `.servo/repo/snapshot-status.md` were refreshed after WT-064.
- milestone_purpose_alignment: WT-065 directly implements the MS8 addendum AI clarification direction requirements.
- historical_conflict_risk: low; changes should extend clarification schema compatibly and preserve the manual confirmation boundary.
- worktrack_adjustment_recommendations: keep WT-065 as a single feature worktrack.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Implement fixed multi-direction AI clarification for the discussion flow:

- directions are fixed to `知识库依据 / 应用场景 / 需求细节`;
- each direction contains at most 5 questions;
- the UI groups questions by direction while using one unified answer area;
- clarification mode only asks questions; draft mode continues existing max-3 candidate/split-draft behavior and single selected draft handoff.

## Scope In

- Provider-neutral AI clarification types and normalization.
- Deepseek/OpenAI-compatible provider prompt and response normalization.
- `/tickets/ai-discussion` rendering for grouped direction labels and unified answer input.
- Compatibility handling for old flat `questions` provider responses.
- Focused unit/API tests for provider normalization, draft service request shape, and route behavior.

## Scope Out

- Physical knowledge-base deletion or slug rewrite.
- New database schema or migration.
- Complex multi-turn conversation state machine.
- Automatic ticket creation or mutation.
- Changing draft candidate cap above 3 or bypassing single selected draft handoff.

## Acceptance Criteria

1. Clarification response can carry direction groups with the fixed labels `知识库依据 / 应用场景 / 需求细节`.
2. Each direction is capped at 5 questions after provider normalization.
3. Old flat clarification question responses remain accepted and are mapped safely.
4. UI presents grouped direction labels and keeps one answer map/input model across all questions.
5. Draft generation remains separate from clarification and still returns one or up to configured max-3 drafts.
6. `npm run lint`, focused tests, full tests, and `npm run build` pass.

## Rollback Conditions

- Provider normalization breaks existing flat clarification responses.
- UI loses the ability to generate a draft from answered clarification questions.
- AI output can create or submit tickets without user action.
