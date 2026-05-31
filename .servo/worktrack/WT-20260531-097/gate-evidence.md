# Gate Evidence: WT-20260531-097

## Metadata

- worktrack_id: WT-20260531-097
- title: MS-10 最终 CodeReview Worktrack
- milestone_id: MS-10
- branch: worktrack/wt-20260531-097-ms10-code-review
- status: gate-blocked

## Review Evidence

- Review diff baseline: `6cf5b347e652f30cafed645e7792dfd94d6fee8e..14d547e2ab62286a0b7885bf20bbb90ef34f397b`.
- Reviewed production surfaces: `src/lib/knowledge/retrieval.ts`, `src/lib/knowledge/embeddings.ts`, `prisma/schema.prisma`, `prisma/migrations/20260531171610_add_search_index_schema/migration.sql`, `prisma/migrations/20260531184500_add_pgvector_embedding/migration.sql`, `scripts/retrieval-evaluation-gate.mjs`.
- Reviewed tests/docs: `src/lib/knowledge/retrieval.test.ts`, `src/lib/knowledge/embeddings.test.ts`, `src/lib/knowledge/search-index-schema.test.ts`, `docs/ms10-*.md`, `docs/retrieval-evaluation-harness.md`, `docs/retrieval-evaluation-ms10-results.json`.
- Review report: `docs/ms10-code-review.md`.

## Findings

- High: `retrieveKnowledgeSnippets()` advertises `postgres-native-fts-fallback` evidence but does not execute PostgreSQL FTS. It loads the newest 100 filtered snippets and performs application-side substring scoring, so lexical recall can miss older relevant snippets and MS-10 FTS evidence is overstated.

## Validation Evidence

- `git diff --check` passed.
- Review artifacts are docs/control-plane only.

## Gate Surfaces

- review-gate: blocked.
- policy-gate: pass.
- gate_verdict: blocked pending lexical FTS repair Worktrack.
