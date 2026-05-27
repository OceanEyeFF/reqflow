# Worktrack Contract: WT-20260528-050

## Metadata

- worktrack_id: WT-20260528-050
- title: Provider 手动验收记录模板
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: docs
- status: planned
- created_at: 2026-05-28
- updated: 2026-05-28

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 reopened before final acceptance because programmer has not yet tested DeepSeek API and local OpenAI-compatible API availability.
- snapshot_freshness: baseline `b2baeac` includes provider config UI/API and final validation report, but no operator test record template.
- milestone_purpose_alignment: Gives MS7 final acceptance a concrete manual evidence format without pretending external API availability was already verified.
- historical_conflict_risk: Must not store real API keys or secrets in docs.
- worktrack_adjustment_recommendations: Create a concise manual test record template for DeepSeek, LMStudio/Ollama no-key, failure cases, and acceptance signature.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: b2baeac
- work_branch: worktrack/wt-20260528-050-provider-manual-test-template
- worktree_path: .worktrees/wt-20260528-050-provider-manual-test-template
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: documentation + validation
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Create a manual Provider validation record template for final MS7 acceptance, covering DeepSeek API and local OpenAI-compatible no-key providers.

### In Scope

- Manual test template for DeepSeek API key mode.
- Manual test template for local LMStudio/Ollama no-key mode.
- Fields for endpoint, model, no-key mode, masked key observation, test connection result, AI draft result, citation behavior, failure notes, and acceptance signer.
- Clear warning not to paste real API keys or secrets into the record.

### Out of Scope

- Actually performing the programmer's external API tests.
- Adding automated network tests against paid or local providers.
- Changing provider implementation.

## Acceptance Criteria

1. A committed template exists for recording DeepSeek API and local no-key API verification.
2. Template includes pass/fail, evidence notes, and secret-redaction instructions.
3. Template distinguishes test-connection success from AI draft end-to-end success.
4. MS7 final acceptance boundary remains with the programmer.
