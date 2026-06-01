# Pre-Milestone Intake Review: MS-16

## Intake Status

- intake_status: ready
- ready_for_init_milestone: true
- programmer_confirmed: true
- intake_skipped: false
- template_contract_ref: pre-milestone-intake-review.template.md

## Request Summary

fdch0 wants a formal selection review for whether ReqFlow should use PostgreSQL
with a BM25 plugin as the default runtime, with particular interest in the
ParadeDB default-runtime path because the product is still pre-production.

The review must estimate cost and expected benefit for each path, rather than
only repeating that ParadeDB passed MS-15.

## Observed Facts

- MS-15 is accepted by fdch0.
- MS-15 validated ParadeDB `pg_search` on a digest-pinned candidate runtime.
- ParadeDB candidate runtime passed Prisma migration, seed, PostgreSQL/search
  readiness, web smoke, Chinese BM25 benchmark, and hybrid invariant comparison.
- The current accepted default runtime is still MS-13: PostgreSQL/pgvector with
  native FTS fallback.
- No production migration has happened.
- No default runtime switch has been made.
- The application retrieval code has not yet been wired to ParadeDB `pg_search`
  as the lexical lane.

## Inferred Assumptions

- Because the product is pre-production, default runtime migration cost is lower
  now than it would be after production launch.
- fdch0 is open to choosing ParadeDB as default if the gate shows the cost and
  risk are acceptable.
- The next milestone should be a decision/gate milestone, not an immediate
  implementation milestone.

## Unknowns

- Whether fdch0 wants MS-16 to end with a binding decision to switch default
  runtime, or only a recommendation.
- Whether larger local zip corpus evidence should be required before switching
  default runtime.
- Whether production/deployment environment constraints are in scope now.
- Whether runtime switching should include app retrieval implementation in the
  same milestone or be a follow-up milestone.

## Programmer Decisions Required

The current request resolves the highest-risk decision enough for initialization:

- fdch0 wants a selection review gate.
- fdch0 wants scheme 3, ParadeDB default runtime, to be seriously evaluated.
- fdch0 wants cost and expected benefit estimates for each path.

Residual decisions should be handled as MS-16 worktrack outputs:

- final default-runtime decision;
- whether to require larger local zip corpus testing;
- whether implementation follows immediately after the review.

## Risk Flags

- runtime-selection
- database-runtime
- migration-boundary
- default-runtime-switch
- search-quality
- pre-production-window

## Open Questions

No blocking intake questions remain. The remaining questions are intentionally
captured as MS-16 worktrack subjects.

## Recommended Answers

- Recommended initial stance: evaluate three paths, with a serious bias toward
  ParadeDB default runtime because the project is still pre-production.
- Recommended gate stance: do not switch default runtime inside the review
  milestone; let MS-16 produce a decision and implementation plan.
- Recommended follow-up if scheme 3 wins: create a separate implementation
  milestone for default runtime switch and app lexical-lane wiring.

## Scope Boundary

In scope:

- cost/benefit/risk comparison for default PostgreSQL without BM25, optional
  ParadeDB profile, and ParadeDB default runtime;
- evidence matrix from MS-13/MS-14/MS-15;
- migration and rollback cost estimates;
- operational and developer experience impact;
- decision report and implementation follow-up plan.

## Non Goals

- No immediate default runtime switch.
- No production data migration.
- No Docker volume deletion.
- No app retrieval implementation.
- No external search service evaluation.
- No renewed VectorChord-BM25 or `pg_textsearch` evaluation.

## Acceptance Signals

- Three runtime paths have explicit cost, benefit, risk, and confidence estimates.
- The recommendation clearly states whether to keep, defer, optionalize, or
  switch default runtime.
- The report defines follow-up Worktracks if ParadeDB default runtime is chosen.
- No doc claims BM25 is active before implementation.

## Suggested Milestone Brief

- milestone_id: MS-16
- title: PostgreSQL Runtime Selection Review and ParadeDB Default Switch Decision
- milestone_kind: goal-driven
- purpose: Decide whether ReqFlow should keep the current non-BM25 PostgreSQL
  default runtime, keep ParadeDB optional, or move toward ParadeDB as default,
  using explicit cost/benefit/risk estimates and MS-15 evidence.
- priority: 19
- depends_on_milestones: [MS-15]
- completion_threshold_pct: 100

Candidate worktracks:

1. WT-20260601-128: Runtime path cost/benefit model and decision criteria.
2. WT-20260601-129: ParadeDB default-runtime migration impact and rollback cost.
3. WT-20260601-130: App retrieval integration impact and expected product benefit.
4. WT-20260601-131: Option comparison ADR and fdch0 decision gate.

## Confirmation State

- confirmation_required: false
- programmer_confirmed: true
- confirmation_source: fdch0 requested the new milestone and explicitly said
 方案3 should be considered, with a gate that estimates cost and expected benefit.

## Handoff To Init Milestone

- handoff_to_init_milestone: ready
- recommended_action: initialize and activate MS-16.

## Skip Record

- intake_skipped: false
- skip_reason: N/A
- accepted_risk: N/A
