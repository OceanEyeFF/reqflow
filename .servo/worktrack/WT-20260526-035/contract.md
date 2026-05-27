# Worktrack Contract: WT-20260526-035

## Metadata

- worktrack_id: WT-20260526-035
- title: 草稿确认与工单表单衔接
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; baseline branch `develop`; WT-031 through WT-034 are completed; discussion UI exists; existing `/tickets/new` form still owns final ticket creation.
- snapshot_freshness: Repo Snapshot/Status, RepoScope Analysis, Control State, milestone-backlog, and worktrack-backlog identify WT-20260526-035 as the next worktrack. Current worktree baseline is `63850c55cc88fcbe6bd5c90f971db01622c7dc1b`.
- milestone_purpose_alignment: directly supports MS6 completion signal 4 and acceptance criterion 3 by connecting accepted AI draft content to the existing manual ticket creation form.
- historical_conflict_risk: high; this handoff must not bypass final user submit, store draft server-side, expose secrets, create tickets directly, or expand into MS7 upload/import scope.
- worktrack_adjustment_recommendations: implement narrow browser-only staging from discussion page to new-ticket form, deterministic description formatting, visible AI-draft notice, and discard/clear path.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 63850c55cc88fcbe6bd5c90f971db01622c7dc1b
- work_branch: worktrack/wt-20260526-035-draft-confirmation-flow
- worktree_path: .worktrees/wt-20260526-035-draft-confirmation-flow
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Implement a deterministic, manual-confirmation handoff from accepted AI draft to the existing `/tickets/new` form.

### In Scope

- Stage accepted draft fields in browser session storage.
- Navigate from discussion page to `/tickets/new?from=ai-draft`.
- Prefill title, description, type, and priority in the existing new-ticket form.
- Compose structured draft sections into a plain-text description.
- Show an AI-draft notice on the new-ticket page.
- Provide a clear/discard staged draft action.
- Preserve existing final submit behavior through `POST /api/tickets`.

### Out of Scope

- Direct ticket creation from discussion page.
- Server-side draft persistence or database migrations.
- Draft history, token/cost ledger, prompt registry, or audit storage.
- Deepseek adapter changes.
- Administrator knowledge-base upload, docs zip import, parsing, chunking, source/version records, or admin UI.
- PostgreSQL, pgvector, embeddings, vector databases, semantic search, or background indexing.

## Typed Execution Policy

- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- fallback_reason: discussion page and new-ticket form changes share one browser handoff contract

## Acceptance Criteria

- Accepting a draft on the discussion page stages fields and navigates to `/tickets/new?from=ai-draft`.
- New-ticket form loads staged title, deterministic description, type `需求`, and suggested priority.
- User can edit all prefilled fields before submitting.
- User can clear the staged AI draft from the form.
- No ticket is created until the existing form submit button is used.
- No client code reads Deepseek env vars or calls Deepseek directly.
- No administrator upload/docs zip import or PG/pgvector/vector capability is introduced.
- `npm run lint`, `npm run test`, and `npm run build` pass.

## Verification Requirements

- `git diff --cached --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted search for `sessionStorage`, `/tickets/new?from=ai-draft`, `/api/tickets`, `/api/ai/draft`, manual confirmation copy, `DEEPSEEK`, upload/zip/pgvector exclusions, and direct ticket creation

## Rollback Conditions

- Discussion page posts directly to `/api/tickets`.
- New-ticket form auto-submits staged draft content.
- Draft is persisted server-side or in the database.
- Client code references Deepseek secret/env variables.
- Implementation introduces upload/import scope, DB migrations, PG/pgvector/vector dependencies, or AI draft persistence.
