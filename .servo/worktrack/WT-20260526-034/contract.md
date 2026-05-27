# Worktrack Contract: WT-20260526-034

## Metadata

- worktrack_id: WT-20260526-034
- title: AI 需求生成 Discussion 页面 UI
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; baseline branch `develop`; WT-031 through WT-033 are completed; `/api/ai/draft` exists; WT-035 will handle final draft-to-ticket-form staging.
- snapshot_freshness: Repo Snapshot/Status, RepoScope Analysis, Control State, milestone-backlog, and worktrack-backlog identify WT-20260526-034 as the next worktrack. Current worktree baseline is `dec41bb04fe875cd1606cc45664f09c5b4aada72`.
- milestone_purpose_alignment: directly supports MS6 completion signal 4 by exposing the AI requirement discussion surface and draft review flow.
- historical_conflict_risk: high; UI must not expose Deepseek secrets, bypass manual confirmation, create tickets directly, or expand into MS7 knowledge upload/import scope.
- worktrack_adjustment_recommendations: implement the discussion page, ticket-list entry, API consumption, clarification/draft/citation/failure states, and visible manual-confirmation controls; leave final form staging to WT-035.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: dec41bb04fe875cd1606cc45664f09c5b4aada72
- work_branch: worktrack/wt-20260526-034-discussion-ui
- worktree_path: .worktrees/wt-20260526-034-discussion-ui
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Build the AI requirement-generation discussion page UI that consumes the internal draft API and keeps AI output in a review-only/manual-confirmation state.

### In Scope

- Add a protected dashboard route for AI requirement discussion.
- Add an entry point from the tickets page.
- Implement client-side state for raw requirement, clarification questions, user answers, draft generation, draft review, citations, and failure states.
- Call `POST /api/ai/draft` for clarify/draft modes.
- Show generated title, background, user story, acceptance criteria, pending questions, suggested priority, and citations.
- Provide accept/edit/discard/restart controls that do not create tickets.
- Preserve clear manual confirmation boundary; final ticket-form staging is WT-035.

### Out of Scope

- Draft-to-ticket-form staging/prefill implementation.
- Existing new-ticket form changes.
- Direct ticket creation or mutation.
- Deepseek provider implementation changes.
- Administrator knowledge-base upload, docs zip import, parsing, chunking, source/version records, or admin UI.
- PostgreSQL, pgvector, embeddings, vector databases, semantic search, or background indexing.

## Typed Execution Policy

- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- fallback_reason: UI page, route entry, and validation are tightly coupled in this slice

## Acceptance Criteria

- User can open the discussion page from the tickets area.
- Page supports entering a vague requirement, requesting clarification, answering questions, generating a draft, viewing citations, and handling API errors.
- Draft preview renders all MS6 required fields.
- Accept action does not create a ticket and clearly remains a manual-confirmation/staging boundary for WT-035.
- No client code reads Deepseek env vars or calls Deepseek directly.
- No administrator upload/docs zip import or PG/pgvector/vector capability is introduced.
- `npm run lint`, `npm run test`, and `npm run build` pass.

## Verification Requirements

- `git diff --cached --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted search for `DEEPSEEK`, `/api/ai/draft`, `/api/tickets`, manual confirmation copy, upload/zip/pgvector exclusions, and direct ticket creation

## Rollback Conditions

- UI posts directly to `/api/tickets`.
- UI exposes or references Deepseek secrets.
- UI claims a ticket is created before WT-035 manual form handoff exists.
- Implementation introduces upload/import scope, DB migrations, PG/pgvector/vector dependencies, or AI draft persistence.
