# Gate Evidence: WT-20260601-102

## Control Signal

- status: validated
- verdict: pass
- baseline_ref: 17c5611

## Evidence

- Current implementation uses native PostgreSQL FTS fallback evidence label `postgres-native-fts-fallback`.
- Prior readiness evidence records `pg_search` as unavailable in the current image and native PostgreSQL FTS fallback as required.
- MS-12 scope explicitly forbids claiming BM25/pg_search as current default behavior before target environment readiness passes.

## Validation

- pass: focused tests `vitest run src/lib/knowledge/lexical-engines.test.ts src/lib/knowledge/retrieval.test.ts src/lib/ai/knowledge.test.ts src/lib/ai/deepseek-provider.test.ts src/app/api/ai/draft/route.test.ts src/app/api/admin/knowledge/search/route.test.ts`; 6 files / 58 tests.
- pass: `npm run lint`; ESLint 0 warnings.
- pass: `npm run test`; 33 files / 254 tests.
- pass: `npm run build`; production build completed with the known worktree root warning only.
- pass: `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions`; PostgreSQL 16.14, pgvector 0.8.2, native PostgreSQL FTS pass, pg_search unavailable with fallback required.
- pass: `git diff --check`; no whitespace errors, Windows line-ending warnings only.

## Implementation Evidence

- Added `src/lib/knowledge/lexical-engines.ts` with typed descriptors for active `postgres-native-fts-fallback` and target `pg-search-bm25`.
- `src/lib/knowledge/retrieval.ts` now uses the active lexical engine descriptor for debug evidence instead of repeating the engine string.
- `src/lib/ai/types.ts` now accepts the shared lexical engine id type in safe coverage diagnostics.
- Added `docs/ms12-bm25-readiness-and-lexical-engine-design.md` documenting current readiness, future pg_search requirements, and anti-claim boundary.

## Gate Verdict

- implementation_gate: pass
- validation_gate: pass
- policy_gate: pass
- overall_verdict: pass
- allowed_next_routes:
  - Close and merge to `develop`.
