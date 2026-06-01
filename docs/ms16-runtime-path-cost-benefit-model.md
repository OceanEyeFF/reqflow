# MS-16 Runtime Path Cost/Benefit Model

## Metadata

- milestone: MS-16
- worktrack: WT-20260601-128
- updated: 2026-06-01
- status: decision model

## Purpose

This model defines how MS-16 will compare three PostgreSQL runtime paths before
fdch0 makes a runtime selection decision:

1. Keep the current PostgreSQL/pgvector plus native FTS fallback as the default.
2. Keep ParadeDB `pg_search` as an optional candidate profile.
3. Move toward ParadeDB `pg_search` as the default PostgreSQL runtime.

The model is a decision input, not a runtime switch. It does not modify
`docker-compose.runtime.yml`, migrate data, delete volumes, or implement app
retrieval changes.

## Evidence Inputs

| Input | Use |
| --- | --- |
| `docs/ms13-final-validation.md` | Current accepted default runtime evidence: PostgreSQL 16, pgvector, native FTS fallback, runtime smoke, and non-destructive operator boundary. |
| `docs/ms14-final-decision-report.md` | BM25 candidate comparison: ParadeDB is the leading measured candidate; VectorChord-BM25 and `pg_textsearch` remain deferred. |
| `docs/ms15-final-decision-report.md` | ParadeDB candidate runtime result and explicit recommendation to defer default switch until selection and implementation work are approved. |
| `docs/ms15-paradedb-operator-runbook.md` | Candidate start/smoke/benchmark/stop and rollback commands, including separate candidate volumes and no destructive cleanup. |
| `docs/ms15-paradedb-hybrid-comparison.md` | Same-corpus lexical comparison plus hybrid invariant boundary. |
| `docs/ms15-paradedb-candidate-benchmark-results.json` | Measured ParadeDB `pg_search` benchmark result: PostgreSQL 18.4, `pg_search` 0.23.5, `vector` 0.8.1, BM25 gate pass. |
| `docs/ms15-paradedb-hybrid-comparison-results.json` | Derived lexical comparison: ParadeDB Recall@5/10 `1.0000`, avg p50 `279.831ms`, EXPLAIN coverage `1.0000`; native FTS is fixture/control evidence. |

## Scoring Dimensions

Use a 1-5 score per dimension. Higher is better for value dimensions and lower
risk/cost for cost dimensions. The final ADR may adjust weights, but must state
the reason.

| Dimension | Weight | Meaning |
| --- | ---: | --- |
| Engineering cost | 15 | Effort to change runtime definitions, scripts, docs, app integration, and CI/dev expectations. |
| Validation cost | 15 | Required smoke, Prisma, search extension, benchmark, retrieval, and regression proof. |
| Migration and rollback cost | 15 | Existing volume/data handling, fallback path, and recovery complexity. |
| Operator cost | 10 | Day-to-day start/stop/smoke/troubleshooting burden and support clarity. |
| Developer experience | 10 | Local setup repeatability, branch/worktree friction, and debugging clarity. |
| Search quality benefit | 15 | Ranking quality, Chinese retrieval behavior, and measured lexical lane value. |
| Product capability benefit | 10 | Ability to offer true BM25 lexical behavior and future hybrid-search improvements. |
| Strategic timing fit | 10 | Whether pre-production status makes this path more attractive now than later. |

Interpretation:

- `>= 4.0`: strong candidate, provided hard blockers are absent.
- `3.0 - 3.9`: viable but needs targeted follow-up evidence.
- `< 3.0`: defer unless fdch0 accepts explicit tradeoffs.

## Path 1: Keep Current Default Runtime

Definition: keep `docker-compose.runtime.yml` on the accepted MS-13 runtime:
PostgreSQL 16 + pgvector + native PostgreSQL FTS fallback.

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Engineering cost | 5 | No default runtime change, no compose migration, no app retrieval rewrite. |
| Validation cost | 4 | Existing MS-13/MS-15 smoke and fallback gates remain useful; periodic regression still needed. |
| Migration and rollback cost | 5 | No data movement and no new rollback path. |
| Operator cost | 4 | Current runbook is already accepted and simple. |
| Developer experience | 4 | Current local path is known and repeatable. |
| Search quality benefit | 2 | Native FTS fallback is not BM25 and remains weak evidence for Chinese ranking quality. |
| Product capability benefit | 2 | Does not unlock true BM25 behavior in the default path. |
| Strategic timing fit | 2 | Avoids change now, but loses the pre-production window advantage. |

Weighted score: `3.60`.

Expected benefit:

- Lowest short-term risk.
- Keeps current development stable.
- Avoids migration and runtime-image churn.

Expected cost:

- Leaves true BM25 as future-only capability.
- May defer a runtime switch until after more app surface depends on the current
  fallback, making later migration more expensive.
- Continues requiring careful wording that native FTS fallback is not BM25.

Best fit:

- Choose this path if fdch0 values runtime stability over search-quality
  enablement, or if WT-129/WT-130 expose unexpected ParadeDB migration or app
  integration blockers.

## Path 2: Keep ParadeDB Optional/Candidate Profile

Definition: keep the MS-15 ParadeDB compose path as a validated optional profile
or candidate runtime while the default remains MS-13.

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Engineering cost | 4 | Candidate compose and runbook already exist; further work is mainly maintenance and clearer profile documentation. |
| Validation cost | 3 | Need periodic candidate smoke and benchmark checks to avoid stale evidence. |
| Migration and rollback cost | 4 | No default data migration, and rollback is mostly stop candidate/start default. |
| Operator cost | 3 | Two runtime paths increase documentation and support burden. |
| Developer experience | 3 | Useful for validation, but dual paths can create confusion about active behavior. |
| Search quality benefit | 3 | Keeps measured BM25 evidence available, but app default users still do not benefit. |
| Product capability benefit | 3 | Enables continued ParadeDB experiments without committing default behavior. |
| Strategic timing fit | 3 | Preserves optionality but may underuse the pre-production migration window. |

Weighted score: `3.30`.

Expected benefit:

- Maintains a safe candidate lane for repeated ParadeDB validation.
- Avoids immediate default-runtime migration risk.
- Lets WT-129/WT-130 refine migration and app integration cost before a switch.

Expected cost:

- Dual-runtime documentation and support burden.
- Risk of stale candidate profile if it is not part of regular validation.
- Does not deliver BM25 as default product behavior.

Best fit:

- Choose this path if fdch0 wants to keep ParadeDB warm but needs more evidence
  before committing to default runtime migration.

## Path 3: Move Toward ParadeDB Default Runtime

Definition: select ParadeDB `pg_search` as the intended default PostgreSQL
runtime path, then open follow-up implementation work to change runtime defaults
and app lexical retrieval after fdch0 approval.

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Engineering cost | 2 | Requires default compose/image changes, docs updates, app lexical adapter work, and CI/dev expectation updates. |
| Validation cost | 2 | Must rerun Prisma, smoke, strict `pg_search`, benchmark, retrieval, and regression gates on the default path. |
| Migration and rollback cost | 2 | PostgreSQL 16 to ParadeDB/PostgreSQL 18 runtime difference needs explicit data/volume and rollback planning. |
| Operator cost | 3 | Candidate runbook exists, but default path runbooks and troubleshooting must be rewritten and proven. |
| Developer experience | 3 | Single BM25-capable default can simplify long-term behavior after switch, but the transition has friction. |
| Search quality benefit | 5 | ParadeDB has the strongest measured BM25 signal: corpus gate passed, Recall@5/10 `1.0000`, and EXPLAIN coverage exists. |
| Product capability benefit | 5 | Unlocks true BM25 lexical lane as a default foundation for future hybrid retrieval. |
| Strategic timing fit | 5 | Pre-production status materially lowers migration risk compared with switching after launch. |

Weighted score: `3.35`.

Expected benefit:

- Converts validated BM25 candidate evidence into the likely default product
  foundation while the project is still pre-production.
- Reduces future conceptual debt: the default runtime and intended search
  architecture can align around true BM25 plus pgvector.
- Creates a clearer path for app retrieval integration: ParadeDB ranked IDs feed
  RRF-style fusion without raw score addition.

Expected cost:

- Requires a separate implementation milestone or worktracks.
- Requires explicit migration and rollback plan for existing local data before
  touching default runtime.
- Requires app retrieval integration before claiming BM25 product behavior.
- Tokenizer evidence remains ranking-compatible, not final Chinese word-level
  segmentation proof.

Best fit:

- Choose this path if fdch0 accepts a higher near-term implementation and
  validation cost to use the pre-production window and make BM25 the default
  runtime foundation.

## Cross-Path Decision Criteria

The final MS-16 ADR should not use a single score mechanically. It must answer
these gates:

1. Does ParadeDB default migration have a non-destructive rollback plan?
2. Can app retrieval use ParadeDB as a lexical lane while preserving RRF-style
   fusion and avoiding raw score addition?
3. Is the current Chinese benchmark sufficient for a default runtime decision,
   or does fdch0 require a larger local zip corpus before the switch?
4. Are PostgreSQL 18 and ParadeDB image/operator implications acceptable for
   local/dev/test now?
5. Does the pre-production timing advantage outweigh the validation and
   migration cost?

## Initial Interpretation

Path 1 has the best cost/risk score but the weakest product/search upside.
Path 2 is the safest way to preserve optionality but risks carrying dual-runtime
complexity without delivering default BM25 behavior. Path 3 has the highest
strategic and product upside, and fdch0's pre-production timing preference is
substantive; it should remain a serious candidate even though it requires the
most follow-up validation.

The next MS-16 worktracks should therefore focus on the two decisive unknowns:

- WT-20260601-129: quantify ParadeDB default migration and rollback cost.
- WT-20260601-130: quantify app retrieval integration cost and product benefit.

## Non-Claims

- This model does not switch the default runtime.
- This model does not claim BM25 is active in `docker-compose.runtime.yml`.
- This model does not migrate existing volumes or production data.
- This model does not implement app retrieval changes.
- This model does not make fdch0's final runtime decision.
