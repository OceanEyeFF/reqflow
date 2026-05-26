# Worktrack Contract: WT-20260526-029

## Metadata

- worktrack_id: WT-20260526-029
- title: AI MVP 技术决策 Brief
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-001`; baseline branch `develop`; GitHub CI passed; cloud-readiness boundary exists; PostgreSQL/pgvector migration and AI implementation remain out of MS5 scope.
- snapshot_freshness: Repo Snapshot/Status and RepoScope Analysis identify WT-20260526-029 as next and require an AI MVP technical decision brief covering lightweight MVP boundaries, manual confirmation, knowledge source, OpenAI integration boundary, and no PostgreSQL/pgvector dependency.
- milestone_purpose_alignment: directly supports MS5 completion signal 5 and acceptance criterion 5.
- historical_conflict_risk: medium; documentation must not implement AI, add dependencies, select paid services, create production secrets, or imply vector storage is required for MS6 MVP.
- worktrack_adjustment_recommendations: keep scope to a docs-only decision brief plus nearest entrypoint links.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 82a255d1e174d320d9b04ddf85987a52b2a7cb59
- work_branch: worktrack/wt-20260526-029-ai-mvp-brief
- worktree_path: .worktrees/wt-20260526-029-ai-mvp-brief

## Scope

### Goal

Document the AI MVP technical decision boundary before MS6 implementation begins.

### In Scope

- New AI MVP technical brief under `docs/`.
- README/handoff entrypoint links to the new brief.
- WT-029 contract, plan queue, and gate evidence.
- Official OpenAI documentation references for API surface and secret-handling boundary.

### Out of Scope

- Implementing AI features or adding application source code.
- Installing OpenAI SDK dependencies or changing package files.
- Creating or committing API keys, prompts-as-runtime config, production secrets, or provider credentials.
- PostgreSQL/pgvector migration or vector database implementation.
- Selecting a paid provider, pricing plan, or production hosting platform.
- Changing Prisma schema, migrations, CI workflow, deployment workflow, or runtime adapters.

## Typed Execution Policy

- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Brief states the MS6 AI MVP starts lightweight and does not require PostgreSQL or pgvector.
- Brief explains manual confirmation, knowledge source boundaries, OpenAI API integration boundary, and secret-handling requirements.
- Brief references current official OpenAI docs for the API surface and API-key boundary without locking implementation to a paid plan.
- Documentation preserves the MS5 boundary: no AI implementation, no production secret creation, no provider purchase, no database migration.
- README and handoff point readers to the AI MVP technical brief.
- Validation for documentation-only changes passes.

## Verification Requirements

- `git diff --check`
- targeted consistency search for AI MVP topics and scope exclusions
- review that no source/config/schema/package files changed

## Rollback Conditions

- Documentation implies API keys should be exposed client-side or committed.
- Documentation requires PostgreSQL/pgvector for the lightweight MVP.
- Documentation selects a paid provider/plan or implements runtime behavior.
- Documentation changes source, schema, package, CI, or deployment surfaces.
