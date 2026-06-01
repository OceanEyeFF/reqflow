# MS-16 App Retrieval Integration Impact And Product Benefit

## Metadata

- milestone: MS-16
- worktrack: WT-20260601-130
- updated: 2026-06-02
- status: integration impact estimate

## Purpose

This report estimates the scope, cost, risk, and expected product value of
wiring ParadeDB `pg_search` into ReqFlow's application retrieval path as the
lexical lane.

It is a planning artifact. It does not implement the adapter, does not switch
the default runtime, and does not claim BM25 is active in the app.

## Current App Retrieval Shape

| Area | Current evidence | Impact |
| --- | --- | --- |
| Active lexical engine | `src/lib/knowledge/lexical-engines.ts` sets `postgres-native-fts-fallback` as active and keeps `pg-search-bm25` as target-runtime-required. | Runtime readiness and app behavior are intentionally separated today. |
| Lexical candidate query | `src/lib/knowledge/retrieval.ts` uses `to_tsvector('simple', ...)`, `websearch_to_tsquery('simple', ...)`, `ts_rank_cd`, and a secondary app score. | ParadeDB integration should replace or branch this lexical query, not the fusion layer. |
| Filters | Retrieval already filters knowledge base, source enabled/status, snippet enabled, version ready, and KB enabled. | ParadeDB adapter must preserve the same permission/source filters. |
| Fusion | `retrieveHybridKnowledgeSnippets()` fuses lexical and vector lanes with reciprocal-rank-fusion evidence and `rawScoreAddition: false`. | `pg_search` raw scores must remain lane-local evidence and must not be added to vector scores. |
| Context/citations | Fused snippet IDs are loaded into citations and context windows. | ParadeDB adapter must return stable snippet IDs/source metadata compatible with the existing context window. |
| Tests | `src/lib/knowledge/retrieval.test.ts` verifies native fallback behavior and RRF no-raw-score-addition. | Future implementation needs ParadeDB-active tests plus fallback tests. |

## Likely Implementation Scope

### Retrieval Adapter

Primary files:

- `src/lib/knowledge/retrieval.ts`
- `src/lib/knowledge/lexical-engines.ts`

Expected change:

- Split lexical candidate retrieval into an engine-aware boundary:
  - current native FTS fallback path;
  - future ParadeDB `pg_search` path.
- Keep the output contract as ranked lexical hits with snippet IDs, source IDs,
  metadata, rank, score, matched terms, and engine ID.
- Preserve RRF fusion unchanged except for accepting `pg-search-bm25` lexical
  hits as rank inputs.

Estimated cost: medium.

Risk:

- SQL surface differs from native FTS.
- `pg_search` index/query semantics need a Prisma migration and runtime-only
  tests.
- The adapter must avoid treating raw BM25 scores as comparable with vector
  similarity.

### Schema And Migration

Primary files:

- `prisma/schema.prisma`
- new Prisma migration under `prisma/migrations/*`

Expected change:

- Add the app-level `pg_search`/BM25 index or SQL migration needed for
  `KnowledgeSnippet` plus lexical metadata search.
- Preserve `SearchIndexProfile.lexicalEngine` as the profile-level engine
  declaration.
- Keep native FTS fallback available unless fdch0 explicitly accepts a
  ParadeDB-only app path.

Estimated cost: medium to high.

Risk:

- Prisma does not model extension-specific index DDL cleanly in schema syntax;
  raw SQL migration may be required.
- Migration must be gated to ParadeDB runtime or safe when `pg_search` is not
  available.

### Tests And Evidence

Primary files:

- `src/lib/knowledge/retrieval.test.ts`
- `src/lib/knowledge/lexical-engines.test.ts`
- retrieval evaluation docs/results

Expected change:

- Add engine-readiness tests for active `pg-search-bm25`.
- Add retrieval tests showing ParadeDB lexical lane returns ranked IDs and
  preserves filters.
- Add fallback tests for native FTS when `pg_search` is unavailable or disabled.
- Extend retrieval evaluation so the app path, not only the isolated benchmark,
  is measured with ParadeDB as the lexical lane.

Estimated cost: medium.

Risk:

- Tests need a ParadeDB-capable database to prove the real adapter.
- Unit-only mocks are insufficient for default-runtime claims.

### AI/Admin Evidence Consumers

Likely touchpoints:

- `src/lib/ai/knowledge.ts`
- `src/app/api/admin/knowledge/search/route.ts`

Expected change:

- Update evidence display or debug payload expectations if active engine changes
  from `postgres-native-fts-fallback` to `pg-search-bm25`.
- Preserve citation traceability and bounded context behavior.

Estimated cost: low to medium.

Risk:

- Misleading UI/debug text could claim BM25 before runtime and app gates pass.

## Product Benefit Estimate

| Benefit area | Expected value | Basis |
| --- | --- | --- |
| True BM25 lexical ranking | high | MS-15 measured `pg_search` Recall@5/10 `1.0000` on the current Chinese benchmark and EXPLAIN coverage exists. |
| Chinese business retrieval | medium to high | `pdb.unicode default` is ranking-compatible on current corpus, but tokenizer proof remains coarse. |
| Hybrid retrieval architecture alignment | high | ParadeDB can feed ranked lexical IDs into the existing RRF design without raw-score fusion. |
| Operator/debug clarity | medium | A single default runtime with true BM25 could reduce future "target vs active" wording debt after implementation. |
| Immediate user-visible benefit | medium | Benefit appears only after app adapter and retrieval gates exist; runtime switch alone is not enough. |

## Validation Plan For Future Implementation

Minimum validation before claiming app-level ParadeDB BM25 behavior:

1. `npm run lint`.
2. `npm run test`.
3. `npm run build`.
4. `npm run retrieval:evaluate` with ParadeDB as the actual app lexical lane.
5. `SEARCH_REQUIRE_PG_SEARCH=true npm run search:extensions` against the
   ParadeDB runtime.
6. ParadeDB runtime smoke with `npm run runtime:smoke`.
7. BM25 corpus gate using `npm run paradedb:candidate-benchmark` and
   `npm run bm25:evaluate`.
8. Policy scan proving no raw score addition and no false native-FTS-as-BM25
   claims.

Optional but recommended if fdch0 wants stronger product evidence:

- larger local zip-import corpus;
- selected knowledge-base filter cases;
- disabled-source/archived-source traps;
- synonym/query-expansion cases;
- latency sampling on a bigger snippet set.

## Decision Impact

WT-130 makes Path 3 more attractive only if fdch0 accepts a follow-up
implementation milestone. The expected product benefit is real, but it is not
delivered by runtime migration alone. The app adapter is the boundary between
"ParadeDB runtime is available" and "ReqFlow uses BM25 in product retrieval."

Recommended input to the final ADR:

- If fdch0 chooses ParadeDB default, require a follow-up implementation plan
  with separate slices for runtime default, schema/index migration, app lexical
  adapter, retrieval evaluation, and rollback validation.
- Preserve native FTS fallback until the ParadeDB app lane has passed gates.
- Do not claim app-level BM25 behavior from MS-15 runtime evidence alone.

## Non-Claims

- This report does not implement `pg_search` in app retrieval.
- This report does not switch active lexical engine constants.
- This report does not add a Prisma migration.
- This report does not claim BM25 is active in the default runtime or product.
- This report does not make fdch0's final runtime decision.
