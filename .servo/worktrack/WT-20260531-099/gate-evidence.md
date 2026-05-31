# Gate Evidence: WT-20260531-099

## Metadata

- worktrack_id: WT-20260531-099
- title: MS-10 Lexical PostgreSQL FTS fallback 修复
- milestone_id: MS-10
- branch: worktrack/wt-20260531-099-lexical-fts-repair
- status: gate-passed

## Implementation Evidence

- `src/lib/knowledge/retrieval.ts` now uses PostgreSQL `to_tsvector('simple', ...) @@ websearch_to_tsquery('simple', ...)` inside the database-side lexical candidate query.
- The query still applies selected knowledge-base, enabled knowledge-base/source/snippet, source status, and ready version filters before retrieval output.
- Chinese tokenization remains in query understanding and is used to build the FTS query and matched-term evidence.
- `src/lib/knowledge/retrieval.test.ts` adds a regression where 105 newer noise snippets no longer hide an older relevant snippet.

## Validation Evidence

- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx vitest run src/lib/knowledge/retrieval.test.ts` passed: 1 file / 26 tests.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run postgres:readiness` passed.
- `npm run retrieval:evaluate` passed.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json` passed.
- `npm run lint` passed.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run test` passed: 30 files / 235 tests.
- `npm run build` passed. Known worktree multi-lockfile warning observed; no build failure.
- `git diff --check` passed.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
