# Gate Evidence: WT-20260531-096

## Metadata

- worktrack_id: WT-20260531-096
- title: MS-9 最终 CodeReview Worktrack
- milestone_id: MS-9
- node_type: review
- status: in_progress
- created_at: 2026-05-31
- carrier_decision: current-carrier with explorer sidecar

## Review Scope

- Current baseline: `8b92a1c8864d861e7d3ff51571e5bd1935accd58`
- Areas: retrieval evaluation gate, search extension readiness, PostgreSQL test helper, CI workflow, Prisma migration/provider boundary, docs consistency, and runtime scope drift.

## Findings

Resolved finding:

1. `scripts/search-extension-readiness.mjs` still created `pg_search` in the maintenance database when `pg_search` was available.
   - severity: high
   - file: `scripts/search-extension-readiness.mjs`
   - issue: WT-094 moved the `vector` extension probe into a temporary database, but the optional `pg_search` branch still used the maintenance connection. In an environment where `pg_search` exists, the command could leave database-scoped extension state in the caller's database.
   - fix: changed the optional `pg_search` `CREATE EXTENSION` call to use the temporary probe database client.
   - verification: `npm run search:extensions` passed; temporary database cleanup check returned `[]`.

No remaining critical/high blocker found in local review.

Sidecar finding resolved:

2. Retrieval result contract accepted duplicate/unknown cases and over-broad returned arrays.
   - severity: medium
   - file: `scripts/retrieval-evaluation-gate.mjs`
   - issue: result files could include duplicate or unknown `caseId` values and append extra returned IDs beyond rank 5.
   - fix: the gate now rejects unknown case IDs, duplicate case IDs, `returnedSourceIds` longer than 5, and `returnedSnippetIds` longer than 5.
   - verification: duplicate, unknown, and overbroad negative fixtures are rejected as expected.

## Validation Evidence

- `npm ci`: pass; npm emitted registry TLS notices and a Windows cleanup EPERM warning.
- `node --check scripts/search-extension-readiness.mjs`: pass.
- `node --check scripts/retrieval-evaluation-gate.mjs`: pass.
- `node --check scripts/postgres-readiness.mjs`: pass.
- `node --check scripts/wait-for-postgres.mjs`: pass.
- `git diff --check`: pass; only local LF-to-CRLF warnings for edited files.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json .servo/worktrack/WT-20260531-094/retrieval-result-positive.json`: pass.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json .servo/worktrack/WT-20260531-094/retrieval-result-cheat.json`: rejected as expected.
- `.servo/worktrack/WT-20260531-096/retrieval-result-duplicate.json`: rejected as expected.
- `.servo/worktrack/WT-20260531-096/retrieval-result-unknown.json`: rejected as expected.
- `.servo/worktrack/WT-20260531-096/retrieval-result-overbroad.json`: rejected as expected.
- `npm run search:extensions` with PostgreSQL `DATABASE_URL` and `SEARCH_EXTENSION_DATABASE_URL`: pass; pgvector pass, native PostgreSQL FTS pass, pg_search unavailable fallback recorded.
- Temporary probe database cleanup check: `SELECT datname FROM pg_database WHERE datname LIKE 'reqflow_ext_%'` returned `[]`.
- `npm run postgres:readiness`: pass.
- `npm run lint`: pass.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev`: pass, 28 files / 201 tests.
- `npm run build`: pass; known Next.js worktree multi-lockfile warning only.

## Sidecar Review

- Sidecar finding 1 (`pg_search` readiness mutates caller database): confirmed and fixed by running optional `pg_search` extension creation through the temporary probe database client.
- Sidecar finding 2 (retrieval result contract accepts duplicate/unknown/overbroad results): confirmed and fixed by strict result set validation and negative fixtures.
- Sidecar confirmed no unexpected runtime AI/knowledge behavior drift and PostgreSQL provider boundary consistency.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass
