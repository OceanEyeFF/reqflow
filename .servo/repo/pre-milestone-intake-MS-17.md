# Pre-Milestone Intake Review: MS-17

## Intake Status

- intake_status: ready
- request_summary: fdch0 accepted MS-16 Option 3 and confirmed the next stage should implement ParadeDB as the default local PostgreSQL runtime using fresh test data, without carrying forward MS-13 development data.
- confirmation_required: true
- programmer_confirmed: true
- ready_for_init_milestone: true
- intake_skipped: false
- template_contract_ref: pre-milestone-intake-review.template.md

## Observed Facts

- MS-16 is accepted by fdch0 on 2026-06-02 with `accept-option-3`.
- MS-16 selected ParadeDB `pg_search` as the intended future default PostgreSQL runtime direction.
- MS-16 did not switch `docker-compose.runtime.yml`, did not implement app retrieval changes, and did not migrate or delete data.
- MS-15 validated a digest-pinned ParadeDB candidate runtime with PostgreSQL 18.4, `pg_search` 0.23.5, and `vector` 0.8.1.
- MS-15 candidate runtime passed Prisma migrate deploy, seed, readiness, strict `pg_search` readiness, web smoke, Chinese BM25 benchmark, and same-corpus lexical comparison.
- MS-16 ADR identified required follow-up work: default runtime compose implementation, app lexical adapter, schema/index migration, app retrieval validation, runbook, rollback validation, and optional larger corpus/tokenizer validation.
- fdch0 clarified that MS-17 does not need to consider the MS-13 data set and should use a new test data set.

## Inferred Assumptions

- Because ReqFlow is still pre-production, fresh test data is acceptable as the new validation baseline.
- MS-13 remains useful as a runtime/config rollback reference, but not as a data rollback target.
- The milestone should include app retrieval enablement because runtime switch alone would not produce BM25 product behavior.
- The milestone should still avoid destructive cleanup of old volumes/data even if those data are out of MS-17 validation scope.

## Unknowns

- Exact composition of the new test corpus and whether it should include imported local business documents, synthetic fixtures, or both.
- Whether the new corpus should replace existing seed data globally or only drive runtime/retrieval validation scripts.
- Whether default runtime switch should be implemented by editing `docker-compose.runtime.yml` directly or by preserving a profile/override transition pattern.
- Whether a larger Chinese tokenizer validation corpus is required before fdch0 accepts MS-17, or whether current MS-14/MS-15 corpus plus fresh product fixtures is sufficient.

## Programmer Decisions Required

- Decision: use fresh ParadeDB data as the MS-17 validation baseline.
  - programmer answer: approved.
- Decision: do not require MS-13 old data migration or compatibility validation in MS-17.
  - programmer answer: approved.
- Decision: keep destructive deletion out of scope.
  - programmer answer: preserved from MS-16 and prior runtime milestones.

Residual decisions can be resolved inside MS-17 worktracks:

- exact new corpus/seed shape;
- compose implementation shape;
- final tokenizer/corpus sufficiency for fdch0 acceptance.

## Risk Flags

- database-runtime-switch
- default-compose-change
- fresh-data-baseline
- schema-index-migration
- app-retrieval-behavior-change
- rollback-scope-change
- Chinese-tokenizer-evidence

## Open Questions

No blocking intake questions remain. The remaining choices are implementation-level decisions that should be handled by MS-17 worktracks and gates.

## Recommended Answers

- Use fresh ParadeDB volume/data as the only MS-17 runtime validation baseline.
- Keep old MS-13 volume/data untouched and out of acceptance scope.
- Treat rollback as runtime/config rollback, not old-data restoration.
- Include app lexical adapter work in MS-17 so the product path can actually use `pg_search`.
- Preserve native FTS fallback as an explicit fallback path during and after the switch.

## Scope Boundary

In scope:

- Default local PostgreSQL runtime implementation using ParadeDB `pg_search`.
- Fresh test data/corpus design for runtime and retrieval validation.
- `pg_search` schema/index migration for a fresh database.
- App lexical adapter and engine gating for ParadeDB vs native FTS fallback.
- Hybrid retrieval validation with actual ParadeDB lexical lane and RRF-style fusion.
- Operator runbook, smoke validation, and runtime/config rollback documentation.

Out of scope:

- MS-13 old volume/data migration.
- Dump/restore from old PostgreSQL 16 development data into ParadeDB/PostgreSQL 18.
- Deleting old Docker volumes, uploads, model cache, or database state.
- Production deployment choice.
- External search service integration.
- VectorChord-BM25 or `pg_textsearch` re-evaluation.

## Non Goals

- Do not preserve or migrate old MS-13 development data.
- Do not claim production migration readiness.
- Do not remove native FTS fallback.
- Do not add raw BM25 and vector scores together.
- Do not delete or clean existing local volumes as part of milestone success.

## Acceptance Signals

- Default local runtime path starts with ParadeDB and fresh data.
- `pg_search` and `vector` readiness are verified in the default runtime path.
- Prisma validate/migrate deploy/seed and web smoke pass on the fresh ParadeDB runtime.
- App lexical retrieval uses ParadeDB `pg_search` when available and falls back explicitly when unavailable.
- Hybrid retrieval validation proves RRF-style fusion and citation behavior with actual ParadeDB lexical lane.
- New test corpus and Chinese/product search quality gates pass or document blockers/caveats.
- Runtime/config rollback to the previous MS-13-style path is documented and validated without old-data restoration claims.
- Final handback does not claim old data migration, production readiness, or destructive cleanup.

## Suggested Milestone Brief

- milestone_id: MS-17
- title: ParadeDB Default Runtime Implementation with Fresh Test Data
- milestone_kind: goal-driven
- purpose: Implement ParadeDB `pg_search` as ReqFlow's default local PostgreSQL runtime using fresh validation data, wire the app lexical lane to `pg_search`, preserve native FTS fallback, and validate runtime/config rollback without migrating old MS-13 data.
- priority: 20
- depends_on_milestones: [MS-16]
- completion_threshold_pct: 100

Candidate worktracks:

1. WT-20260602-132: ParadeDB default runtime compose implementation with fresh volume.
2. WT-20260602-133: New test corpus and seed baseline for ParadeDB validation.
3. WT-20260602-134: Runtime smoke, readiness, and config rollback validation on fresh data.
4. WT-20260602-135: `pg_search` schema/index migration for fresh database.
5. WT-20260602-136: App lexical adapter and engine gating.
6. WT-20260602-137: Hybrid retrieval validation with actual ParadeDB lexical lane.
7. WT-20260602-138: Chinese/product corpus quality gate and tokenizer caveat review.
8. WT-20260602-139: Operator runbook, final CodeReview, and MS-17 handback.

## Confirmation State

- confirmation_required: true
- programmer_confirmed: true
- confirmation_source: fdch0 said the revised target is acceptable as the next-stage goal after clarifying that MS-13 data does not need to be considered and a new test data set should be used.
- confirmation_date: 2026-06-02
- residual_risk: New corpus sufficiency and exact default compose implementation shape remain MS-17 worktrack decisions.

## Handoff To Init Milestone

- handoff_to_init_milestone: ready
- recommended_milestone_id: MS-17
- pre_milestone_intake_required: true
- pre_milestone_intake_status: ready
- recommended_action: initialize and activate MS-17 because no active milestone exists and MS-16 is accepted.

## Skip Record

- intake_skipped: false
- skip_reason: N/A
- accepted_risk: N/A
