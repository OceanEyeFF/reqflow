# Gate Evidence: WT-20260529-086

## Metadata

- worktrack_id: WT-20260529-086
- title: RRF Hybrid fusion、reranker seam 与 score evidence
- milestone_id: MS-10
- branch: worktrack/wt-20260529-086-hybrid-fusion-score-evidence
- status: gate-passed

## Implementation Evidence

- Added `retrieveHybridKnowledgeSnippets()` in `src/lib/knowledge/retrieval.ts`.
- Preserved existing `selectKnowledgeSnippets()` and lexical `retrieveKnowledgeSnippets()` behavior for current callers.
- Added RRF-style fusion with `k = 60`; lexical and vector raw scores are preserved as evidence but not added directly.
- Added hybrid debug evidence with query understanding, lexical evidence, vector lane status, vector hits, fused hits, RRF contribution, and reranker seam state.
- Added optional injected reranker seam; default behavior is no reranker and no external provider dependency.
- Added focused retrieval tests for overlap fusion, vector-only fusion, returned vector failure degradation, thrown vector failure degradation, empty query vector skip, reranker seam sanitization, and existing lexical behavior.
- Added `docs/ms10-hybrid-fusion.md`.
- Consumed read-only review findings and fixed vector exception degradation, empty hybrid query behavior, and reranker output guardrails.

## Validation Evidence

- `npm ci`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx prisma generate --schema prisma/schema.prisma`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx vitest run src/lib/knowledge/retrieval.test.ts`: pass, 1 file / 19 tests.
- `npm run lint`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run postgres:readiness`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run search:extensions`: pass; pgvector readiness pass, native PostgreSQL FTS readiness pass, `pg_search` unavailable fallback recorded.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run test`: pass, 30 files / 228 tests.
- `npm run build`: pass on retry; first attempt hit transient Google Fonts fetch failure, second attempt passed with known worktree multi-lockfile warning only.

## Policy Review

- Scope stayed within hybrid fusion, score evidence, reranker seam, focused tests, and docs.
- Context window expansion, citation aggregation, AI draft integration, admin debug UI, external reranking providers, and evaluation harness expansion remain deferred.
- Fusion uses rank-based RRF evidence and explicitly does not raw-score-add lexical and vector values.
- Vector lane fail-closed results degrade to lexical-only fused evidence.
- Vector lane thrown exceptions also degrade to lexical-only fused evidence.
- Empty/invalid hybrid queries do not run vector retrieval and return no citations.
- Reranker output is sanitized to existing fused candidates, deduplicated, capped, and cannot inject arbitrary snippet ids.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
