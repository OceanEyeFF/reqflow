# Pre-Milestone Intake Review: MS-14

## Intake Status

- intake_status: ready
- request_summary: fdch0 accepted MS-13 and requested the next milestone to test PostgreSQL plus BM25 plugin cooperation, including Chinese compatibility, execution efficiency, and accuracy.
- programmer_confirmed: true
- ready_for_init_milestone: true
- intake_skipped: false
- template_contract_ref: pre-milestone-intake-skill

## Observed Facts

- MS-13 completed 6/6 worktracks and produced `docs/ms13-final-validation.md`.
- Current default runtime is `pgvector/pgvector:0.8.2-pg16` plus native PostgreSQL FTS fallback.
- Current default runtime exposes `vector` but not a supported BM25 extension candidate.
- Existing docs identify BM25 candidate families: ParadeDB `pg_search`, Timescale/TigerData `pg_textsearch`, and VectorChord-BM25 / `pg_tokenizer`.
- Existing retrieval architecture uses PostgreSQL native FTS fallback, pgvector, and RRF-style fusion; BM25 is not active behavior.

## Inferred Assumptions

- The milestone should evaluate BM25 plugin candidates in isolated candidate runtimes before changing the default MS-13 compose path.
- Chinese compatibility should include segmentation/tokenization behavior, phrase/term matching, mixed Chinese-English content, and domain vocabulary.
- Accuracy should be measured against existing retrieval evaluation patterns plus additional Chinese business cases.
- Performance should include index build time, query latency, and explain-plan/resource observations on repeatable datasets.

## Unknowns

- Which BM25 extension candidate will be compatible with the local Docker environment, PostgreSQL version, license, and operational constraints.
- Whether a candidate requires PostgreSQL 17/18, preload settings, a custom image, or different query/index integration.
- Which candidate offers acceptable Chinese tokenization without unacceptable operational complexity.
- Whether BM25 quality gain is enough to justify replacing or supplementing native PostgreSQL FTS fallback.

## Programmer Decisions Required

- Accept that MS-14 is an evaluation/PoC milestone, not a default runtime switch.
- Accept that candidate images/extensions may require network pulls/builds and may fail compatibility gates.
- Keep destructive cleanup, production data migration, and default runtime replacement outside the milestone unless separately approved.

## Risk Flags

- Database/runtime compatibility risk.
- Chinese tokenization quality risk.
- License and distribution risk for plugin images/extensions.
- Performance measurement noise from local Docker and small datasets.
- Operational risk if extension preload or data directory compatibility is mishandled.

## Open Questions

- none blocking; fdch0 has given enough direction to initialize an evaluation milestone.

## Recommended Answers

- Use an isolated candidate-runtime path per plugin family and keep the MS-13 default runtime untouched until the final decision report.
- Evaluate candidate plugins against the same Chinese corpus and metrics, then compare with native PostgreSQL FTS fallback and existing hybrid retrieval.

## Scope Boundary

- Evaluate BM25 extension candidates with PostgreSQL in local Docker/runtime contexts.
- Validate Chinese compatibility, performance, and retrieval accuracy.
- Produce evidence-backed recommendation for whether and how BM25 should become a future runtime option.

## Non Goals

- Do not make BM25 the default runtime in this milestone unless fdch0 separately approves after evidence.
- Do not migrate production data.
- Do not delete existing Docker volumes, uploads, or model caches.
- Do not remove native PostgreSQL FTS fallback.
- Do not change AI provider secret handling.
- Do not introduce external hosted search or a non-PostgreSQL search service.

## Acceptance Signals

- Candidate BM25 plugin runtimes are researched and tested against explicit compatibility gates.
- Chinese corpus and evaluation harness compare BM25 candidates with native FTS fallback.
- Performance benchmark records index build time, query latency, and explain-plan/resource observations.
- Accuracy benchmark records recall/precision-style evidence for Chinese business queries.
- Final decision report recommends one of: adopt candidate, defer candidate, or keep fallback only, with rollback and operator boundaries.

## Suggested Milestone Brief

- milestone_id: MS-14
- title: PostgreSQL BM25 插件中文兼容与性能准确率评估
- milestone_kind: goal-driven
- depends_on_milestones: [MS-13]
- priority: 17
- activation_intent: active after MS-13 acceptance
- completion_threshold_pct: 100
- scope_boundary_note: evaluation milestone only; default runtime replacement requires separate approval.

## Handoff To Init Milestone

- handoff_to_init_milestone: true
- ready_for_init_milestone: true
