# Plan Task Queue: WT-20260601-111

## Queue Status

- status: active
- current_next_action: validate BM25 readiness boundary

## Tasks

1. Compare BM25 candidate runtime paths.
   - status: completed
   - evidence: `docs/ms13-bm25-runtime-feasibility.md`
2. Extend search extension readiness candidate reporting.
   - status: completed
   - evidence: `scripts/search-extension-readiness.mjs`
3. Update operator readiness docs.
   - status: completed
   - evidence: `docs/search-extension-readiness.md`
4. Run validation gates.
   - status: completed
   - commands: `npm run search:extensions`; strict BM25 candidate mode; `npm run build`.
