# Worktrack Contract: WT-20260526-036

## Metadata

- worktrack_id: WT-20260526-036
- title: 安全治理、测试与 MS6 验收
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: test
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; WT-031 through WT-035 are completed; remaining completion signals require safety governance, regression verification, and programmer acceptance handback.
- snapshot_freshness: Control State and milestone/worktrack backlog identify WT-20260526-036 as the next planned MS6 worktrack. Current worktree baseline is `4289853`.
- milestone_purpose_alignment: directly supports MS6 completion signals 5 and 6, and validates all MS6 acceptance criteria before handback.
- historical_conflict_risk: high; this worktrack must not silently accept the milestone, introduce MS7 scope, commit real secrets, or bypass manual ticket confirmation.
- worktrack_adjustment_recommendations: collect final safety evidence, close review/test gaps found during validation, and record MS6 readiness as pending programmer decision.
- add_remove_worktrack_recommendations: none unless validation finds blocking gaps.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 4289853
- work_branch: worktrack/wt-20260526-036-ai-discussion-validation
- worktree_path: .worktrees/wt-20260526-036-ai-discussion-validation
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Validate the MS6 AI requirement discussion MVP end to end, close narrowly-scoped safety/test gaps, and prepare a programmer acceptance handback without marking the milestone accepted.

### In Scope

- Final safety review for Deepseek server-side secret/config boundaries.
- Final review that AI draft generation cannot create tickets directly.
- Final review that accepted drafts only stage browser-side data and require manual ticket form submission.
- Regression tests for AI draft API, provider adapter, knowledge/redaction, and draft handoff helpers.
- Bad JSON request classification for `POST /api/ai/draft`.
- Hydration-safe AI draft prefill and cleanup after successful manual ticket creation.
- Final MS6 validation report and gate evidence.
- Remote CI observation after merge/push if available.

### Out of Scope

- Final milestone acceptance decision; this remains programmer-owned.
- Real Deepseek API key, committed `.env`, production secret creation, billing setup, or live provider smoke test.
- Administrator knowledge-base upload, docs zip import, document parsing/chunking, private storage, source/version management, admin UI, or retrieval expansion.
- PostgreSQL, pgvector, embeddings, vector databases, semantic search, background indexing, or schema migrations.
- Direct ticket creation from the AI discussion page.

## Typed Execution Policy

- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier + read-only explorer sidecar
- fallback_reason: validation fixes and evidence documents share small coupled surfaces; read-only sidecar used for independent safety review.

## Acceptance Criteria

- Deepseek API key, base URL, model, timeout, and provider calls remain server-side only.
- `POST /api/ai/draft` requires auth, maps weak input and malformed JSON to 400, hides provider secrets, and never mutates tickets.
- Discussion page calls only `/api/ai/draft`, stages accepted drafts in browser storage, and navigates to `/tickets/new?from=ai-draft`.
- New-ticket page loads AI drafts after client mount, lets users edit/clear them, clears staged draft after successful manual ticket creation, and still creates only through form submit.
- Tests cover API auth/weak input/malformed JSON/provider failures, provider config/response handling, redaction/knowledge fallback, and draft handoff helpers.
- No MS7 scope or PG/pgvector/vector dependency is introduced.
- `npm run lint`, `npm run test`, and `npm run build` pass.
- Final evidence reports MS6 ready for programmer acceptance decision, not accepted.

## Verification Requirements

- `git diff --check`
- targeted safety/range searches for Deepseek env exposure, `NEXT_PUBLIC`, `/api/tickets`, Prisma ticket creation, `sessionStorage`, MS7 upload/zip/pgvector terms
- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`
- read-only review sidecar findings triage
- remote GitHub CI observation after merge/push when possible

## Rollback Conditions

- Any client code reads Deepseek secrets or calls Deepseek directly.
- AI discussion page posts directly to `/api/tickets`.
- AI draft route mutates tickets or database state.
- New-ticket page auto-submits staged AI draft content.
- Implementation introduces MS7 knowledge upload/import scope, migrations, PG/pgvector/vector dependencies, real secrets, or committed env files.
- Validation cannot pass and no equivalent gate evidence is available.
