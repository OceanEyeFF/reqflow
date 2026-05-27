# Worktrack Contract: WT-20260526-032

## Metadata

- worktrack_id: WT-20260526-032
- title: 最小内置知识语料与引用策略
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; baseline branch `develop`; WT-20260526-031 is completed; WT-032 must define minimal inspectable knowledge context before Deepseek API implementation.
- snapshot_freshness: Repo Snapshot/Status, RepoScope Analysis, Control State, milestone-backlog, and worktrack-backlog identify WT-20260526-032 as the next worktrack. Current worktree baseline is `4acfde09445714978fdd2ad580fa51312379c28c`.
- milestone_purpose_alignment: directly supports MS6 completion signal 2 by defining repo-stable knowledge context and citation snippets while preserving MS7 split.
- historical_conflict_risk: medium; this worktrack must not introduce upload, zip import, embeddings, PostgreSQL/pgvector, background indexing, production secrets, or real Deepseek calls.
- worktrack_adjustment_recommendations: keep scope to source whitelist, sourceId naming, snippet rules, redaction/exclusion policy, empty-context fallback, and downstream implementation notes.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 4acfde09445714978fdd2ad580fa51312379c28c
- work_branch: worktrack/wt-20260526-032-minimal-knowledge-citations
- worktree_path: .worktrees/wt-20260526-032-minimal-knowledge-citations
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Define the MS6 minimal built-in knowledge corpus and citation strategy for the AI requirement discussion MVP.

### In Scope

- Select a small repo-stable source whitelist for MS6 knowledge context.
- Define source IDs, source titles, ownership, and intended use for citations.
- Define snippet extraction, length, ordering, and empty-context fallback rules.
- Define exclusion/redaction rules for secrets, test credentials, local machine paths, generated runtime state, stale plans, and MS7 upload/import content.
- Define a provider-neutral knowledge context shape for WT-033.
- Produce downstream notes for WT-033 through WT-036.
- Update WT-032 evidence artifacts.

### Out of Scope

- Any runtime API implementation.
- Deepseek provider adapter implementation or real provider calls.
- Frontend discussion UI implementation.
- Administrator knowledge-base upload, docs zip import, document parsing, chunking, source/version records, or admin knowledge UI.
- PostgreSQL, pgvector, vector databases, embeddings, semantic search, or background indexing.
- Production secrets, `.env` values, paid provider/model decisions, or deployment setup.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier for document writes, explorer subagent for read-only candidate source review
- fallback_reason: canonical source whitelist and Harness artifacts are tightly coupled to the active worktree state

## Acceptance Criteria

- Source whitelist contains a small, explicit set of repo-stable documents with source IDs.
- Citation shape includes source ID, title, path, section anchor, snippet, and freshness/version hint.
- Snippet rules define length, ordering, truncation, and empty-context fallback.
- Sensitive and unstable content exclusions are explicit.
- MS6/MS7 split is preserved, with no administrator upload/docs zip import in MS6.
- No PostgreSQL/pgvector/vector dependency is introduced.
- Downstream implementation notes for WT-033 through WT-036 are recorded.
- Documentation-only validation passes.

## Verification Requirements

- `git diff --cached --check`
- targeted search for source IDs, empty-context fallback, redaction/exclusion terms, MS7 upload exclusion, PostgreSQL/pgvector exclusion, and provider-neutral knowledge shape
- `npm run lint`
- `npm run test`
- `npm run build`
- review that changed files are limited to docs and WT-032 Harness artifacts

## Rollback Conditions

- Documentation permits uploaded/admin documents or docs zip import inside MS6.
- Documentation makes PostgreSQL, pgvector, embeddings, vector search, or background indexing a prerequisite.
- Documentation encourages sending secrets, test credentials, local paths, `.env` values, raw uploads, or full repo history to Deepseek.
- Documentation claims implementation, provider calls, production secret setup, or UI completion.
