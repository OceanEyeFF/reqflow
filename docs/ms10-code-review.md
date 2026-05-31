# MS-10 Code Review

## Scope

Reviewed MS-10 changes from the MS-9 accepted baseline through `14d547e2ab62286a0b7885bf20bbb90ef34f397b`, covering schema, migrations, embedding generation, vector retrieval, hybrid fusion, context window construction, evaluation harness, and MS-10 docs/evidence.

## Findings

### High: Lexical retrieval claims PostgreSQL FTS fallback but uses application-side scoring over the newest 100 snippets

- File: `src/lib/knowledge/retrieval.ts:190`
- File: `src/lib/knowledge/retrieval.ts:202`
- File: `src/lib/knowledge/retrieval.ts:206`
- File: `src/lib/knowledge/retrieval.ts:218`

`retrieveKnowledgeSnippets()` labels its engine and per-hit evidence as `postgres-native-fts-fallback`, but the implementation does not call `to_tsvector`, `websearch_to_tsquery`, `ts_rank`, `@@`, or another PostgreSQL full-text search path. It loads up to `MAX_CANDIDATES = 100` enabled snippets ordered by newest `createdAt`, then scores them in application code with substring matches.

This creates two acceptance risks:

1. Relevant snippets outside the newest 100 rows can be omitted before lexical scoring runs.
2. MS-10 evidence overstates that the fallback lexical lane is PostgreSQL native FTS.

The architecture and milestone acceptance require native PostgreSQL FTS fallback when `pg_search` is unavailable. This is a final-acceptance blocker until repaired or explicitly downgraded by fdch0.

## Open Questions

- None for this finding. The code path is directly observable.

## Recommendation

Add a repair Worktrack before MS-10 final acceptance:

- implement a real PostgreSQL FTS fallback query for lexical retrieval;
- keep explicit Chinese tokenization/normalization;
- preserve existing filters for selected knowledge bases, enabled bases/sources/snippets, source status, and ready versions;
- add regression coverage proving older relevant snippets are still retrieved beyond the previous newest-100 window;
- update evidence/docs to stop overstating FTS behavior before the repair lands.

## Remediation

WT-20260531-099 was opened to repair this blocker. It replaces the newest-100 application-side lexical prefilter with database-side PostgreSQL FTS fallback recall and adds a regression for older relevant snippets beyond the previous newest-candidate window.

## Residual Risk

The embedding/vector/context builder surfaces have useful tests for profile mismatch, provider failure, filter enforcement, RRF no raw-score addition, and context caps. The main blocker is lexical lane truthfulness and recall under larger corpora.
