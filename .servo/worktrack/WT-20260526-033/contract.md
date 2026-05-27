# Worktrack Contract: WT-20260526-033

## Metadata

- worktrack_id: WT-20260526-033
- title: Deepseek Draft API 与 Provider Adapter
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; baseline branch `develop`; WT-031 and WT-032 are completed; provider decision is Deepseek; MS7 owns administrator knowledge-base upload and docs zip import.
- snapshot_freshness: Repo Snapshot/Status, RepoScope Analysis, Control State, milestone-backlog, and worktrack-backlog identify WT-20260526-033 as the next worktrack. Current worktree baseline is `c205c6401d6ebe0333e0ced41b632c3bd7838932`.
- milestone_purpose_alignment: directly supports MS6 completion signal 3 by providing an authenticated server-side draft API and provider adapter that returns structured clarification or draft data.
- historical_conflict_risk: high; implementation must not expose secrets client-side, require real provider credentials in CI, create tickets directly, introduce PG/pgvector, or pull in MS7 upload/import scope.
- worktrack_adjustment_recommendations: implement the smallest server-side API/adapter slice with mocked tests, source whitelist assembly, redaction, timeout/rate guard, and manual-confirmation boundary.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: c205c6401d6ebe0333e0ced41b632c3bd7838932
- work_branch: worktrack/wt-20260526-033-deepseek-draft-api
- worktree_path: .worktrees/wt-20260526-033-deepseek-draft-api
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Implement the MS6 server-side AI draft API and Deepseek provider adapter boundary with deterministic mocked tests.

### In Scope

- Add provider-neutral AI draft/clarification/citation types.
- Add minimal knowledge context assembly using the WT-032 source whitelist.
- Add server-side redaction and input validation.
- Add Deepseek provider adapter with configurable base URL, model, timeout, and API key.
- Add an authenticated internal route handler for draft generation.
- Add tests for unauthenticated request, weak input, empty-context fallback, provider mock success, provider failure/malformed output, missing API key behavior, and no direct ticket creation.
- Preserve manual confirmation: API returns draft/clarification only and never calls `/api/tickets`.

### Out of Scope

- Discussion page UI.
- Draft-to-ticket-form staging UI.
- Real Deepseek API calls in tests or CI.
- Production API key, paid provider/model decision, deployment secret setup, or `.env` commit.
- Administrator knowledge-base upload, docs zip import, parsing, chunking, source/version records, or admin UI.
- PostgreSQL, pgvector, embeddings, vector databases, semantic search, or background indexing.
- Database schema migrations or AI draft persistence.

## Typed Execution Policy

- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- fallback_reason: route, adapter, tests, and Harness artifacts share tightly coupled file ownership in this slice

## Acceptance Criteria

- Authenticated server-side API accepts discussion context and returns either clarification questions or structured draft data.
- API rejects unauthenticated and too-short/empty input.
- Provider adapter reads Deepseek config only on the server and does not expose secrets to client code.
- Tests mock provider behavior and do not require a real `DEEPSEEK_API_KEY`.
- Knowledge citations follow the WT-032 `rf-*` whitelist and empty-context fallback rules.
- API does not create or mutate tickets.
- No PostgreSQL/pgvector/vector dependency, administrator upload, or docs zip import is introduced.
- `npm run lint`, `npm run test`, and `npm run build` pass.

## Verification Requirements

- `git diff --cached --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted search for `DEEPSEEK_API_KEY`, `NEXT_PUBLIC`, `/api/tickets`, `prisma.ticket.create`, PostgreSQL/pgvector/upload/zip exclusions, and provider mock coverage

## Rollback Conditions

- Real provider credentials are required for tests or build.
- Deepseek secret is referenced from client code or exposed in a browser-facing response.
- API creates or mutates tickets directly.
- Implementation introduces DB migrations, PG/pgvector/vector dependencies, upload/import scope, or AI draft persistence.
