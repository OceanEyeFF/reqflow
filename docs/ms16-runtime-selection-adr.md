# MS-16 Runtime Selection ADR

## Metadata

- milestone: MS-16
- worktrack: WT-20260601-131
- updated: 2026-06-02
- status: accepted
- final_decision_owner: fdch0
- final_decision: accept-option-3
- final_decision_by: fdch0
- final_decision_at: 2026-06-02

## Context

ReqFlow currently uses the MS-13 default runtime:

- PostgreSQL 16 through `pgvector/pgvector:0.8.2-pg16`;
- pgvector available;
- PostgreSQL native FTS fallback as the active lexical path;
- RRF-style hybrid retrieval in the app;
- no BM25 behavior in the default runtime.

MS-14 and MS-15 validated ParadeDB `pg_search` as the strongest BM25 candidate:

- ParadeDB candidate runtime passed Prisma migration, seed, readiness, strict
  `pg_search` readiness, web smoke, Chinese BM25 benchmark, and hybrid invariant
  comparison.
- Candidate runtime uses PostgreSQL 18.4, `pg_search` 0.23.5, and `vector`
  0.8.1.
- Same-corpus ParadeDB lexical evidence passed Recall@5/10 `1.0000`, with full
  EXPLAIN coverage.
- Application retrieval is not yet wired to ParadeDB `pg_search`.

MS-16 compares three runtime paths:

1. keep current PostgreSQL/pgvector plus native FTS fallback as default;
2. keep ParadeDB as an optional/candidate profile;
3. move toward ParadeDB `pg_search` as the default PostgreSQL runtime.

## Decision Options

### Option 1: Keep Current Default

Summary:

- Lowest immediate cost and rollback risk.
- Keeps the accepted MS-13 runtime unchanged.
- Leaves true BM25 as future-only capability.

Best when:

- fdch0 values near-term runtime stability more than aligning default runtime
  with the intended BM25 direction.
- ParadeDB migration or app integration risk is judged too high.

Residual risk:

- The pre-production window may be underused.
- Later switching could be more expensive after more workflows depend on the
  current default.

### Option 2: Keep ParadeDB Optional/Candidate

Summary:

- Preserves the validated ParadeDB path without changing default runtime.
- Maintains optionality and a safe benchmark lane.
- Carries dual-runtime documentation and support burden.

Best when:

- fdch0 wants more corpus, tokenizer, or app integration evidence before
  selecting a default.
- The team wants to avoid runtime commitment but not abandon ParadeDB.

Residual risk:

- Candidate profile may become stale unless regularly validated.
- Product default still does not get BM25 behavior.

### Option 3: Select ParadeDB As Future Default

Summary:

- Highest strategic/product upside.
- Uses the pre-production window to align default runtime with true BM25 plus
  pgvector.
- Requires a later implementation milestone before any default runtime switch.

Best when:

- fdch0 accepts higher implementation/validation cost now to avoid a later,
  higher-risk runtime migration.
- The project values true BM25 as a core default search foundation.

Residual risk:

- Runtime switch alone does not deliver app BM25 behavior.
- App lexical adapter, schema/index migration, retrieval gates, and rollback
  validation remain required.
- Tokenizer evidence is ranking-compatible on the current corpus but not final
  Chinese word-level segmentation proof.

## Accepted ADR Position

fdch0 accepted **Option 3 as the intended direction, but no runtime switch is
performed inside MS-16.**

This means:

- MS-16 recommends ParadeDB `pg_search` as the future default PostgreSQL runtime
  direction.
- MS-16 does not approve or perform the switch.
- A follow-up implementation milestone or approved implementation worktracks are
  required before any default runtime switch.
- Native FTS fallback remains the active default until the follow-up
  implementation and gates pass.

Rationale:

1. ParadeDB is already the strongest measured BM25 candidate.
2. MS-15 proved Prisma/app runtime viability on the candidate runtime.
3. The product is pre-production, which materially lowers migration cost.
4. WT-129 identifies a non-destructive low-risk migration shape: fresh
   ParadeDB/PostgreSQL 18 volume, keep old MS-13 volume untouched, reject direct
   volume reuse.
5. WT-130 identifies a viable app integration path: keep RRF fusion, return
   ranked lexical snippet IDs, and do not add raw BM25/vector scores.

Confidence: medium-high for direction, medium for implementation effort.

The confidence is not high because app retrieval is not yet wired to
`pg_search`, the larger corpus/tokenizer question remains open, and default
runtime runbooks still need implementation proof.

## Follow-Up Implementation Worktracks If Option 3 Is Accepted

Create a new implementation milestone or append approved implementation
worktracks after fdch0 accepts the MS-16 final decision:

1. ParadeDB default runtime compose/profile implementation.
   - Update the selected default runtime path.
   - Keep MS-13 rollback path and old volumes untouched.
   - Run compose config, runtime smoke, and strict `pg_search` readiness.
2. ParadeDB app lexical adapter and engine gating.
   - Add engine-aware lexical retrieval boundary.
   - Preserve native FTS fallback.
   - Keep RRF fusion and raw-score separation.
3. ParadeDB schema/index migration.
   - Add required `pg_search` index DDL through safe migration/raw SQL.
   - Ensure migration is safe when `pg_search` is unavailable or explicitly gated.
4. App retrieval validation.
   - Run unit/integration tests, retrieval evaluation, BM25 benchmark, and hybrid
     app evidence with ParadeDB as actual lexical lane.
5. Operator runbook and rollback validation.
   - Document start/smoke/stop/rollback for the new default.
   - Prove rollback to MS-13 path remains non-destructive.
6. Optional larger local corpus/tokenizer validation.
   - Add local zip-import business corpus if fdch0 wants stronger product proof
     before accepting the runtime switch implementation.

## Final Decision

fdch0 selected `accept-option-3` on 2026-06-02:

- Approve ParadeDB `pg_search` as the intended future default PostgreSQL runtime
  direction.
- Use the pre-production window to avoid larger runtime rework later.
- Keep the actual runtime switch, app retrieval implementation, migration, and
  rollback validation in a later approved milestone or worktracks.

The considered choices were:

- `accept-option-1`: keep current default runtime.
- `accept-option-2`: keep ParadeDB optional/candidate only.
- `accept-option-3`: approve ParadeDB as the intended future default direction
  and require a follow-up implementation milestone before switching.
- `request-more-evidence`: require extra corpus/tokenizer/operator evidence
  before choosing.

Accepted decision: `accept-option-3`.

## Explicit Non-Claims

- MS-16 does not switch `docker-compose.runtime.yml`.
- MS-16 does not migrate or delete data.
- MS-16 does not implement app retrieval changes.
- MS-16 does not claim BM25 is active in default runtime or product behavior.
- MS-16 final selection is accepted as `accept-option-3` by fdch0 on
  2026-06-02.
