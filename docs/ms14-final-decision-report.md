# MS-14 Final Decision Report

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-122
- updated: 2026-06-01
- status: ready for fdch0 acceptance review

## Decision Summary

MS-14 evaluated PostgreSQL BM25 plugin candidates for ReqFlow's Chinese
retrieval needs. The evidence supports one future enablement candidate, but it
does not justify changing the default runtime in this milestone.

| Candidate | Decision | Reason |
| --- | --- | --- |
| ParadeDB `pg_search` | adopt as future runtime-enablement candidate | Isolated runtime passed, `pg_search` and `vector` coexist, BM25 index/query path works, Chinese benchmark gate passed, and WT-121 measured Recall@5/10 `1.0000` on the MS-14 corpus. |
| VectorChord-BM25 / `pg_tokenizer` | defer | Runtime compatibility works, but the measured result gate fails on synonym Recall@5 and tokenizer evidence is not human-auditable because result tokens are internal IDs. |
| `pg_textsearch` | defer | The tested `postgres:18` image does not expose the extension, so no index/query/tokenizer/performance evidence exists yet. |
| Native PostgreSQL FTS fallback | keep as current default fallback | It is the accepted MS-13 default lexical fallback, but it is not BM25 and the MS-14 native result is a fixture/control, not measured BM25-quality evidence. |

Default runtime recommendation:

- Do not change the default runtime in MS-14.
- Keep `pgvector/pgvector:0.8.2-pg16` plus native PostgreSQL FTS fallback,
  pgvector, and RRF-style hybrid retrieval.
- Open a future "ParadeDB pg_search runtime enablement" milestone only if fdch0
  approves a runtime-image migration/evaluation step.

## Evidence Coverage

| Worktrack | Evidence |
| --- | --- |
| WT-20260601-115 | Candidate matrix and evaluation plan. |
| WT-20260601-116 | Repeatable Chinese BM25 corpus and result gate. |
| WT-20260601-117 | ParadeDB `pg_search` isolated runtime PoC and measured result. |
| WT-20260601-118 | VectorChord-BM25 / `pg_tokenizer` isolated runtime PoC and measured result. |
| WT-20260601-119 | `pg_textsearch` compatibility evidence showing extension unavailable in tested image. |
| WT-20260601-120 | Chinese tokenization compatibility synthesis. |
| WT-20260601-121 | BM25/native/hybrid accuracy and performance comparison. |

## Candidate Decisions

### ParadeDB `pg_search`

Decision: adopt as future runtime-enablement candidate.

Evidence:

- Runtime image tested: `paradedb/paradedb:latest`.
- PostgreSQL version: `18.4`.
- Installed extensions: `pg_search` `0.23.5`, `vector` `0.8.1`.
- BM25 index creation and query probe passed.
- Index build on the 12-snippet fixture: `346.152 ms`.
- Index size: `3022848 bytes`.
- MS-14 benchmark result gate passed.
- WT-121 derived average Recall@5 `1.0000`, Recall@10 `1.0000`,
  Precision@5 `0.4000`, average p50 `158.993 ms`, average p95 `168.121 ms`.
- EXPLAIN evidence shows ParadeDB base scan / top-k execution.

Caveats:

- The PoC used `pdb.unicode default`; it did not settle the final Chinese
  tokenizer configuration.
- Runtime enablement implies changing from the MS-13 default database image to a
  different PostgreSQL distribution/image path.
- Local 12-snippet fixture latency is not production capacity evidence.

Future enablement conditions:

- Compare `pdb.unicode default` with ParadeDB Chinese-compatible tokenizer on
  the same corpus.
- Run a larger corpus with realistic source paths, disabled-source filters,
  selected knowledge-base filters, and synonym cases.
- Prove Prisma migration compatibility and pgvector coexistence in the target
  image.
- Provide rollback steps back to the MS-13 baseline image and native FTS
  fallback.
- Require explicit fdch0 approval before default runtime switch.

### VectorChord-BM25 / `pg_tokenizer`

Decision: defer.

Evidence:

- Runtime image tested: `tensorchord/vchord-suite:pg18-latest`.
- PostgreSQL version: `18.3`.
- Installed extensions: `pg_tokenizer` `0.1.1`, `vchord_bm25` `0.3.0`,
  `vector` `0.8.2`.
- BM25 index creation and query probe passed after adapting to the installed
  `to_bm25query(regclass, bm25vector)` API.
- Index build on the 12-snippet fixture: `386.583 ms`.
- Index size: `1433600 bytes`.
- WT-121 derived average Recall@5 `0.9444`, Recall@10 `1.0000`,
  Precision@5 `0.3667`, average p50 `158.986 ms`, average p95 `173.601 ms`.

Deferral reasons:

- The benchmark result gate fails on `ms14-synonym-qc-sampling` because
  `snip-direct-outbound-allowed` ranks 7th instead of top 5.
- Tokenizer evidence records internal numeric token IDs rather than
  human-readable Chinese term boundaries.
- Adoption would need tokenizer dictionary work, query expansion, or ranking
  tuning beyond the current evidence.

### `pg_textsearch`

Decision: defer.

Evidence:

- Tested image: `postgres:18`.
- PostgreSQL version: `18.4`.
- `shared_preload_libraries`: empty.
- `pg_textsearch` is not listed in `pg_available_extensions`.
- `CREATE EXTENSION pg_textsearch` was not attempted because the extension was
  unavailable.

Deferral reasons:

- No ready-to-run package/image path was proven.
- No tokenizer, index, query, accuracy, performance, or rollback evidence exists.
- A custom image/package and preload path would be needed before another PoC.

## Current Runtime Boundary

The current default runtime remains:

- database image: `pgvector/pgvector:0.8.2-pg16`;
- lexical engine: PostgreSQL native FTS fallback;
- vector lane: pgvector;
- fusion: RRF-style hybrid retrieval;
- BM25 status: evaluated candidate evidence, not active runtime behavior.

MS-14 does not change:

- `docker-compose.runtime.yml`;
- application retrieval implementation;
- ranking/fusion strategy;
- Prisma schema;
- uploads, model cache, Docker volumes, or existing database state.

## Operational Risks

1. ParadeDB enablement is a runtime-image migration, not a small extension flag.
2. PostgreSQL major-version differences must be tested against Prisma, migrations,
   seed/readiness probes, backup/restore assumptions, and operator runbooks.
3. Chinese tokenizer choice remains open for ParadeDB.
4. VectorChord may become viable, but only after synonym/tokenizer tuning closes
   the current Recall@5 gap.
5. `pg_textsearch` needs packaging/preload proof before it can be compared.
6. Production performance remains unknown because MS-14 used compact local PoC
   fixtures.

## Recommended Future Milestone

Open a new milestone only after fdch0 approves it:

Title: ParadeDB `pg_search` runtime enablement and rollback validation.

Suggested scope:

- Build or pin a target ParadeDB image/tag/digest.
- Validate Prisma migrate deploy, seed, readiness, search extension readiness,
  and web runtime smoke against that image.
- Re-run the MS-14 corpus plus a larger corpus.
- Add same-corpus hybrid comparison using the current RRF-style fusion invariant.
- Compare tokenizer configurations and document dictionary/tokenizer choice.
- Add operator runbook and rollback procedure.
- Keep native PostgreSQL FTS fallback available.

Out of scope for that future milestone unless separately approved:

- production migration;
- destructive volume conversion;
- replacing retrieval fusion strategy;
- introducing a non-PostgreSQL external search service.

## Final MS-14 Acceptance Notes

MS-14 completion signals are satisfied:

1. Candidate matrix exists and records runtime/version/extension/operational
   risks.
2. Chinese benchmark harness is repeatable through `npm run bm25:evaluate`.
3. ParadeDB and VectorChord have isolated runtime PoCs; `pg_textsearch` has
   compatibility evidence.
4. Chinese tokenizer behavior and failures are documented.
5. Accuracy/performance comparison is documented with local-performance caveats.
6. Final decision is documented here.

MS-14 is ready for fdch0 final acceptance review, but not accepted by Codex.

## Non-Claims

- BM25 is not enabled in the default runtime.
- PostgreSQL native FTS is not BM25.
- Local PoC latency is not production performance.
- ParadeDB adoption as a future candidate is not permission to migrate runtime
  images or data.
- Any default runtime change still requires fdch0 approval.
