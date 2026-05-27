# Worktrack Contract: WT-20260526-031

## Metadata

- worktrack_id: WT-20260526-031
- title: Discussion 产品流与信息架构设计
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-002`; baseline branch `develop`; MS5 is completed and accepted; MS6 is scoped to Deepseek-backed discussion MVP; MS7 owns administrator knowledge-base upload and docs-style zip import.
- snapshot_freshness: Repo Snapshot/Status, RepoScope Analysis, Control State, milestone-backlog, and worktrack-backlog identify WT-20260526-031 as the next preparation item. Current worktree baseline is `f78487ea9b7dc68984d4be22b11e928d26a20fd1`.
- milestone_purpose_alignment: directly supports MS6 completion signal 1 by defining discussion states, draft schema, manual confirmation boundary, and downstream API/UI handoff before implementation starts.
- historical_conflict_risk: medium; design must not expand into Deepseek implementation, production secrets, PostgreSQL/pgvector, administrator uploads, zip parsing, or autonomous ticket creation.
- worktrack_adjustment_recommendations: keep WT-031 as documentation-only product flow and information architecture; preserve WT-032 through WT-036 ordering with clarified downstream contracts.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: f78487ea9b7dc68984d4be22b11e928d26a20fd1
- work_branch: worktrack/wt-20260526-031-discussion-flow-design
- worktree_path: .worktrees/wt-20260526-031-discussion-flow-design
- PR target source: Worktrack Contract baseline_branch

## Scope

### Goal

Define the MS6 AI requirement-generation discussion product flow, information architecture, structured draft schema, manual confirmation boundary, and downstream worktrack adjustment notes.

### In Scope

- Document the discussion page user states: initial requirement input, AI clarification questions, user answers, draft generation, accept/edit/discard, and handoff to existing ticket creation flow.
- Define the structured draft schema required by MS6: title, background, user story, acceptance criteria, pending questions, suggested priority, and citations.
- Define the product/API contract boundary for the future Deepseek draft endpoint without implementing it.
- Map AI draft fields to the existing ticket creation form and `/api/tickets` payload.
- Record the invariant that AI output must remain advisory until the user explicitly confirms.
- Confirm the MS6/MS7 split: no administrator knowledge upload or docs zip import in MS6.
- Produce downstream notes for WT-032 through WT-036.
- Update worktrack evidence artifacts for this documentation-only slice.

### Out of Scope

- Deepseek API/provider adapter implementation.
- Discussion page UI implementation.
- Ticket creation form implementation changes.
- Prisma schema, migrations, PostgreSQL, pgvector, embeddings, vector databases, or background indexing.
- Administrator knowledge-base upload, document parsing, docs-style zip import, or admin knowledge UI.
- Production API key, paid provider, model purchase, or deployment secret setup.
- Autonomous ticket creation or mutation.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto
- carrier_decision: current-carrier for document writes, explorer subagent for read-only existing ticket-flow discovery
- fallback_reason: writing the canonical docs and Harness artifacts is tightly coupled to the active worktree state

## Acceptance Criteria

- Product flow covers all required states from raw input through manual confirmation and ticket-form handoff.
- Structured draft schema includes title, background, user story, acceptance criteria, pending questions, suggested priority, and citations.
- Existing ticket creation field mapping is recorded with compatibility risks.
- Deepseek adapter boundary is described at product/API contract level only.
- Manual confirmation invariant is explicit and testable.
- MS6 excludes administrator upload/docs zip import and PostgreSQL/pgvector.
- Downstream WT-032 through WT-036 adjustment notes are recorded.
- Documentation-only validation passes.

## Verification Requirements

- `git diff --check`
- targeted search for MS6/MS7 scope terms, manual confirmation, draft schema, Deepseek boundary, and PG/pgvector exclusions
- review that changed files are limited to docs and WT-031 Harness artifacts

## Rollback Conditions

- Documentation permits AI to create or modify tickets without explicit human confirmation.
- Documentation silently pulls MS7 administrator knowledge-base upload or docs zip import into MS6.
- Documentation introduces PostgreSQL/pgvector/vector database as an MS6 prerequisite.
- Documentation claims Deepseek implementation, secrets, model purchase, or production deployment are complete.
