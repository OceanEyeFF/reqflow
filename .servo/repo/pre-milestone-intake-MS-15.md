# Pre-Milestone Intake Review: MS-15

## Intake Status

- intake_status: ready
- request_summary: fdch0 accepted MS-14 and approved planning the next milestone around ParadeDB runtime replacement testing.
- confirmation_required: true
- programmer_confirmed: true
- ready_for_init_milestone: true
- intake_skipped: false
- template_contract_ref: pre-milestone-intake-skill

## Observed Facts

- MS-14 completed all 8/8 worktracks and was accepted by fdch0 on 2026-06-01.
- MS-14 final report recommends ParadeDB `pg_search` only as a future runtime-enablement candidate.
- MS-14 did not enable BM25 and did not change the default runtime.
- Current default database runtime remains `pgvector/pgvector:0.8.2-pg16` with native PostgreSQL FTS fallback plus pgvector.
- ParadeDB PoC evidence from MS-14:
  - `pg_search` and `vector` coexist in `paradedb/paradedb:latest`;
  - BM25 index/query probe passed;
  - Chinese benchmark result gate passed;
  - PostgreSQL version differs from current default runtime;
  - Chinese tokenizer choice remains open.

## Inferred Assumptions

- The next milestone should test a candidate ParadeDB runtime path in isolation or alternate compose before any default runtime switch.
- Runtime replacement testing should include app-level compatibility, migrations, smoke validation, rollback, tokenizer choice, and same-corpus retrieval comparison.
- Embedding model quality evaluation is related but should not be bundled into the ParadeDB runtime replacement milestone unless explicitly added later.

## Unknowns

- Exact ParadeDB image tag/digest to pin.
- Whether the target should be ParadeDB official image only or a custom hardened image.
- Whether PostgreSQL major-version migration from current pg16 baseline to ParadeDB's tested pg18 path will reveal Prisma/runtime issues.
- Which ParadeDB tokenizer configuration should become the candidate default.
- Whether a future production deployment would accept a database image migration.

## Programmer Decisions Required

- Decision: proceed with a ParadeDB runtime replacement testing milestone.
  - programmer answer: approved.
- Decision: do not include VectorChord or `pg_textsearch` as primary candidates in this milestone.
  - programmer answer: approved by the statement that BM25's only worthwhile continued test path is ParadeDB.
- Decision: do not treat this milestone as permission to switch default runtime.
  - programmer answer: implicit in MS-14 acceptance and future testing framing; keep approval boundary explicit.

## Risk Flags

- database-runtime-migration
- PostgreSQL-major-version-change
- extension-packaging-and-image-pinning
- Prisma-migration-compatibility
- rollback-and-data-safety
- Chinese-tokenizer-selection
- local-performance-not-production-capacity

## Open Questions

1. Which ParadeDB image tag/digest should be pinned?
   - why_it_matters: `latest` is not stable enough for repeatable runtime testing.
   - recommended_answer: start with the currently tested upstream image path, then pin a concrete tag/digest in the first worktrack.
   - tradeoff: avoids premature custom-image work while forcing repeatability before deeper tests.
2. Should runtime replacement mutate the MS-13 default compose immediately?
   - why_it_matters: changing default compose too early could destabilize the accepted local runtime.
   - recommended_answer: no; create an alternate candidate compose or profile first.
   - tradeoff: slower path to default enablement, but safer rollback and clearer evidence.
3. Should embedding model evaluation be part of this milestone?
   - why_it_matters: embedding quality also needs testing, but bundling it with database runtime migration expands blast radius.
   - recommended_answer: no; keep this milestone focused on ParadeDB runtime. Plan embedding evaluation separately.
   - tradeoff: leaves embedding quality as a follow-up milestone but keeps runtime risk isolated.

## Recommended Answers

- Use ParadeDB as the sole BM25 runtime candidate in this milestone.
- Keep VectorChord-BM25 and `pg_textsearch` deferred.
- Use an alternate compose/profile until validation supports a switch proposal.
- Keep native PostgreSQL FTS fallback and pgvector as rollback/current baseline.
- Require fdch0 approval before replacing the default runtime.

## Scope Boundary

- Evaluate whether ReqFlow can run correctly on a ParadeDB PostgreSQL runtime candidate.
- Validate app compatibility, Prisma migrations, readiness, search extension behavior, Chinese benchmark quality, tokenizer choice, local performance, and rollback.
- Produce an enable/defer/reject recommendation for a later default-runtime switch.

## Non Goals

- Do not change the default runtime without separate fdch0 approval.
- Do not migrate existing persistent volumes.
- Do not delete uploads, model cache, Docker volumes, or database state.
- Do not introduce VectorChord-BM25, `pg_textsearch`, or an external search service.
- Do not evaluate embedding model quality in this milestone except where needed to prove existing pgvector coexistence.

## out_of_scope

- Production migration.
- Data conversion of existing volumes.
- Runtime switch on the accepted MS-13 compose path before gate evidence.
- Embedding model benchmark milestone.
- Non-PostgreSQL search service integration.

## Acceptance Signals

- A pinned ParadeDB candidate image/tag/digest is documented.
- An alternate ParadeDB compose/profile can start without touching current volumes.
- Prisma validate/migrate deploy/seed/readiness and web runtime smoke pass against the candidate runtime.
- `pg_search`, `vector`, index DDL, query probe, Chinese tokenizer behavior, and EXPLAIN evidence are recorded.
- MS-14 Chinese benchmark corpus and larger/expanded cases pass or produce documented blockers.
- Rollback to the MS-13 default runtime is documented and validated.
- Final report recommends enable/defer/reject and preserves fdch0 approval boundary.

## Suggested Milestone Brief

- milestone_id: MS-15
- title: ParadeDB `pg_search` Runtime Replacement Validation
- milestone_kind: goal-driven
- purpose: Validate whether ReqFlow can safely use a ParadeDB PostgreSQL runtime candidate for BM25 search while preserving pgvector, migrations, app smoke behavior, Chinese retrieval quality, and rollback to the current MS-13 runtime.
- depends_on_milestones: [MS-14]
- completion_threshold_pct: 100
- candidate_worktracks:
  1. WT-20260601-123: ParadeDB image pinning and alternate compose/profile design.
  2. WT-20260601-124: Prisma migration, seed, readiness, and web smoke against ParadeDB runtime.
  3. WT-20260601-125: `pg_search` integration probe, tokenizer selection, and Chinese benchmark rerun.
  4. WT-20260601-126: Same-corpus hybrid retrieval comparison with ParadeDB lexical lane.
  5. WT-20260601-127: Rollback, operator runbook, and default-runtime switch decision report.
- acceptance_criteria:
  1. Candidate runtime tests do not mutate current default volumes/cache/uploads.
  2. Candidate runtime path is repeatable with pinned image identity.
  3. Prisma and app runtime smoke pass or blockers are documented.
  4. `pg_search` and pgvector coexist with documented extension readiness.
  5. Chinese retrieval quality is compared against current fallback/hybrid baseline.
  6. Final decision does not switch default runtime without fdch0 approval.

## Confirmation State

- programmer_confirmed: true
- confirmation_source: fdch0 said MS-14 is accepted and allowed planning the next milestone around ParadeDB runtime replacement testing.
- confirmation_date: 2026-06-01

## Handoff To Init Milestone

- handoff_to_init_milestone: ready
- recommended_milestone_id: MS-15
- pre_milestone_intake_required: true
- pre_milestone_intake_status: ready

## Skip Record

- intake_skipped: false
- skip_reason: N/A
- accepted_risk: N/A
