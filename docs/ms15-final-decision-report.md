# MS-15 Final Decision Report

## Metadata

- milestone: MS-15
- title: ParadeDB `pg_search` Runtime Replacement Validation
- updated: 2026-06-01
- status: ready for fdch0 final acceptance review

## Recommendation

Recommendation: **defer default runtime switch; approve ParadeDB as the next
implementation candidate.**

ParadeDB `pg_search` is validated strongly enough to plan a future
implementation worktrack for the application lexical lane. It is not yet
validated strongly enough to silently replace `docker-compose.runtime.yml` or
claim BM25 is active in the default runtime.

## Evidence Summary

| Area | Result |
| --- | --- |
| Image/runtime identity | Candidate compose uses digest-pinned `paradedb/paradedb@sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d`, `linux/amd64`, alternate ports, and separate candidate volumes. |
| PostgreSQL layout | PostgreSQL 18 requires mounting candidate DB volume at `/var/lib/postgresql`; the old `/var/lib/postgresql/data` layout fails startup. |
| Prisma/app runtime | Candidate runtime passed Prisma migrate deploy, seed, PostgreSQL readiness, strict `pg_search` readiness, web HTTP 200, lint/test/build. |
| Extension coexistence | PostgreSQL 18.4, `pg_search` 0.23.5, `vector` 0.8.1, `bm25` access method, and `hnsw` access method are present. |
| Chinese BM25 benchmark | Candidate compose runtime passed the 6-case / 12-snippet Chinese BM25 gate. |
| Tokenizer | `pdb.unicode default` is ranking-compatible for the current corpus, but pure Chinese token evidence remains coarse and is not final word-level segmentation proof. |
| Hybrid comparison | ParadeDB lexical lane has same-corpus Recall@5/10 `1.0000`, avg p50 `279.831ms`, and full EXPLAIN coverage. MS-10 hybrid evidence remains valid as RRF/no-raw-score-addition invariant evidence, not same-corpus ParadeDB hybrid performance. |
| Rollback | Non-destructive rollback to MS-13 default runtime remains documented and available. |

## Completed Worktracks

| Worktrack | Outcome |
| --- | --- |
| WT-20260601-123 | Added isolated candidate compose and runtime design. |
| WT-20260601-124 | Validated Prisma migration, seed, readiness, strict `pg_search`, and web smoke on ParadeDB candidate runtime. |
| WT-20260601-125 | Reran Chinese BM25 corpus on the candidate compose runtime and recorded tokenizer/performance/EXPLAIN evidence. |
| WT-20260601-126 | Compared same-corpus lexical lanes and preserved hybrid RRF/no-raw-score-addition boundary. |
| WT-20260601-127 | Added rollback/operator runbook and this decision report. |

## Why Not Switch Default Runtime Now

The candidate has passed runtime and benchmark validation, but these items still
need explicit future work before enabling by default:

1. Application retrieval code still uses the accepted fallback/hybrid path; it
   has not been wired to ParadeDB `pg_search` as the lexical lane.
2. Same-corpus ParadeDB hybrid application performance has not been measured.
3. `pdb.unicode default` passed current ranking gates but is not final Chinese
   tokenizer approval.
4. No existing local or production data migration has been performed or approved.
5. The benchmark corpus is intentionally compact and not production capacity
   evidence.

## Enablement Path

Recommended next milestone or future worktrack:

1. Add a feature-flagged ParadeDB lexical adapter that produces ranked snippet
   IDs and keeps raw BM25 scores out of fusion.
2. Rerun retrieval gates with ParadeDB as lexical lane and vector lane active.
3. Add larger corpus and local zip-import evaluation if fdch0 wants realistic
   business data coverage.
4. Decide tokenizer policy: keep `pdb.unicode default` with caveats, add query
   expansion, or evaluate a Chinese-specific tokenizer path if ParadeDB exposes
   one suitable for this runtime.
5. Draft a data migration/rollback plan for existing volumes before any default
   runtime change.

## Approval Boundary

MS-15 can be accepted as a validation milestone if fdch0 agrees that:

- ParadeDB is the only BM25 candidate worth carrying forward;
- default runtime switch remains deferred;
- future enablement requires a separate approval and implementation plan.

No default runtime switch is made by this report.
