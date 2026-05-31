# MS-9 Final Acceptance Report

## Metadata

- milestone_id: MS-9
- title: PostgreSQL 与 Hybrid Search 架构基线
- status: superseded-by-additional-validation
- prepared_at: 2026-05-31
- prepared_by: harness-kernel
- final_acceptance_owner: fdch0

## Scope Summary

MS-9 establishes the architecture and readiness baseline for PostgreSQL-backed hybrid search. It does not implement the MS-10 retrieval runtime or the MS-11 AI draft context integration.

Included scope:

- PostgreSQL dev/test/CI readiness.
- Prisma provider and migration boundary from SQLite to PostgreSQL.
- pgvector readiness and BM25/FTS deployability decision.
- Hybrid search architecture, SearchIndexProfile invariant, EmbeddingProviderConfig separation, RRF fusion boundary, context builder boundary, reranker seam, and debug evidence contract.
- Fixed Chinese retrieval evaluation corpus and quality gate format.

Excluded scope:

- Production data migration execution.
- External hosted search or third-party vector database adoption.
- Final hybrid retrieval implementation.
- AI draft hybrid context integration.
- Silent active embedding profile changes or uncontrolled background embedding jobs.

## Worktrack Evidence

| Worktrack | Result | Evidence |
|---|---|---|
| WT-20260529-078 | pass | `.servo/worktrack/WT-20260529-078/gate-evidence.md` |
| WT-20260529-079 | pass | `.servo/worktrack/WT-20260529-079/gate-evidence.md` |
| WT-20260529-080 | pass | `.servo/worktrack/WT-20260529-080/gate-evidence.md` |
| WT-20260529-081 | pass | `.servo/worktrack/WT-20260529-081/gate-evidence.md` |
| WT-20260529-082 | pass | `.servo/worktrack/WT-20260529-082/gate-evidence.md` |

## Composite Acceptance Lanes

### Code Review

- verdict: pass
- evidence: WT-078 through WT-082 gate evidence records implementation, review, validation, and policy checks.
- high_severity_findings: none recorded.

### Feature Completeness

- verdict: pass
- evidence:
  - `docs/hybrid-search-architecture.md`
  - `docs/postgres-dev-test-ci-baseline.md`
  - `docs/prisma-postgres-provider-boundary.md`
  - `docs/search-extension-readiness.md`
  - `docs/retrieval-evaluation-harness.md`
  - `docs/retrieval-evaluation-cases.json`
- note: The planned MS-9 worktrack list is complete at 5/5.

### Related Influence

- verdict: pass
- evidence:
  - AI draft manual confirmation boundary preserved.
  - Knowledge-base enabled/archived/source/snippet filtering boundary preserved.
  - Production migration and provider billing decisions remain outside MS-9 and require fdch0 approval.

### Intent Completeness

- verdict: pass
- evidence:
  - PostgreSQL is now the Prisma provider baseline.
  - pgvector readiness is executable.
  - `pg_search` is recorded as unavailable in the current dev/test/CI image, so native PostgreSQL FTS plus Chinese tokenization/normalization is the required fallback.
  - Evaluation harness can express expected sources/snippets, must-contain terms, forbidden sources, recall@5, noise@5, selected knowledge-base scope, and citation traceability.

### Operator Simulation

- verdict: pass
- evidence:
  - PostgreSQL readiness scripts and CI jobs are present.
  - Retrieval evaluation corpus gate is available through `npm run retrieval:evaluate`.
  - Search extension readiness is available through `npm run search:extensions`.
- residual: Remote GitHub Actions execution after WT-082 has not been observed in this local handback.

### Professional Review

- verdict: pass
- evidence:
  - MS-9 keeps architecture/readiness separate from implementation.
  - SearchIndexProfile immutability and embedding dimension/model boundaries are explicit.
  - Hybrid ranking avoids raw BM25/vector score addition and uses RRF-style fusion as the default design.
  - Fallback and deployability risks are recorded instead of being hidden as implementation facts.

## Database Readiness Gate

- `npx prisma validate --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`: pass in WT-080 validation.
- `npx prisma migrate status --schema prisma/schema.prisma` with PostgreSQL `DATABASE_URL`: pass in WT-080 and WT-081 validation.
- `npm run postgres:readiness`: pass in WT-080 and WT-081 validation.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL`: pass, 28 files / 201 tests in WT-080, WT-081, and WT-082 validation.
- `npm run build` with PostgreSQL `DATABASE_URL`: pass in WT-080 and WT-082 validation.

## Final Verification Summary

- `node --check scripts/retrieval-evaluation-gate.mjs`: pass.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx prisma generate`: pass.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL`: pass, 28 files / 201 tests.
- `npm run build` with PostgreSQL `DATABASE_URL`: pass, only the known Next.js multi-lockfile worktree warning.

## Residual Risks

- MS-10 must implement actual lexical/vector/fusion retrieval before real recall quality can be measured against produced result files.
- `pg_search` must not be claimed as available unless a target deployment proves extension install/preload readiness.
- Native PostgreSQL FTS fallback requires tokenized and normalized Chinese lexical text.
- Production SQLite-to-PostgreSQL migration execution remains a separate approval item.
- Remote CI after WT-082 remains unobserved from this local session.

## Additional Validation Reopen

fdch0 requested two extra MS-9 validation worktracks after this report was prepared:

- WT-20260531-094: MS-9 代码验收与集成风险审查.
- WT-20260531-095: MS-9 grill-me 反向拷打验收.

This report is retained as pre-additional-validation evidence and is no longer the final handback artifact.

## Acceptance Decision Boundary

MS-9 final acceptance is reopened until WT-20260531-094 and WT-20260531-095 complete. This report does not mark the milestone accepted and does not activate MS-10. Final acceptance must be explicitly decided by fdch0 after the added worktracks close.
