# Worktrack Contract: WT-20260526-037

## Metadata

- worktrack_id: WT-20260526-037
- title: 严谨 CodeReview Worktrack
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: review
- status: completed
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-20260526-001`; baseline branch `develop`; WT-025 through WT-030 are completed; programmer final milestone acceptance is still pending.
- snapshot_freshness: current local `develop` includes WT-030 final checkpoint at `7805fe20c412597d3fd11cc7837846ca0747da36`; remote CI evidence was last recorded for `origin/develop` at `40f4c11d119d70c839347de870813a5474c195f5`, so remote freshness must be distinguished from local review freshness.
- milestone_purpose_alignment: adds an explicit rigorous CodeReview before programmer acceptance, covering implementation, tests, policy boundaries, and release-readiness evidence for MS5.
- historical_conflict_risk: medium-high; review must avoid silently accepting MS5, hiding stale remote CI, expanding into MS6 implementation, or mutating unrelated local untracked governance artifacts.
- worktrack_adjustment_recommendations: keep scope to review evidence, validation evidence, policy checks, a code review report, and Harness artifacts. Direct fixes are allowed only for low-risk review/report/Harness corrections needed to make evidence truthful.
- add_remove_worktrack_recommendations: if blocking defects are found outside this worktrack scope, register follow-up worktrack(s) instead of burying them in the review verdict.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: 7805fe20c412597d3fd11cc7837846ca0747da36
- work_branch: worktrack/wt-20260526-037-rigorous-code-review
- worktree_path: .worktrees/wt-20260526-037-rigorous-code-review

## Scope

### Goal

Perform a rigorous CodeReview of the current MS5 baseline before programmer milestone acceptance.

### In Scope

- Review current application source, tests, API routes, auth/session handling, upload and notification flows, Prisma schema/migrations, CI workflow, and MS5 documentation boundaries.
- Run local validation commands that exercise lint, tests, build, and diff hygiene.
- Compare local HEAD, remote `origin/develop`, and GitHub Actions evidence, explicitly marking any freshness gap.
- Produce a review report under `docs/`.
- Update WT-037 contract, plan queue, gate evidence, and MS5/worktrack backlog state.

### Out of Scope

- Marking `MS-20260526-001` as finally accepted.
- Production deployment, provider selection, production secrets, or paid service decisions.
- Gitee push or troubleshooting.
- PostgreSQL/pgvector migration, vector database implementation, or AI feature implementation.
- Broad refactors, feature work, or speculative architecture rewrites.
- Deleting or bulk-modifying pre-existing local untracked governance directories.

## Typed Execution Policy

- baseline_form: commit-on-review-branch
- merge_required: yes
- gate_criteria: review + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- CodeReview findings are ordered by severity and grounded in file/line references where applicable.
- Review covers at least auth/API authorization, file upload, notification/log behavior, tests, Prisma data model, CI workflow, cloud readiness, and AI MVP boundaries.
- Validation commands are run and recorded, including `git diff --check`, `npm run lint`, `npm run test`, and `npm run build`.
- Remote/local CI freshness is stated accurately; stale remote CI must not be represented as proof for a newer local commit.
- Any blocking or material non-blocking issues are either fixed within scope or registered as follow-up worktrack/backlog items.
- Final milestone acceptance remains explicitly pending programmer decision.

## Verification Requirements

- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted static review of source, tests, schema, CI, and MS5 docs
- `git ls-remote origin develop` and local HEAD comparison
- changed-surface check confirming only permitted review/Harness artifacts and any scoped low-risk fixes changed

## Rollback Conditions

- Review claims programmer milestone acceptance without user decision.
- Review hides stale local/remote/CI evidence or weakens quality gates.
- Review introduces PostgreSQL/pgvector, AI implementation, production secrets, provider commitments, or Gitee requirements.
- Review performs broad source changes without a concrete finding and scoped acceptance rationale.
