# Plan / Task Queue: WT-20260529-078

## Task Queue

### T1: Establish worktrack artifacts [completed]
- Create WT-078 contract and task queue.
- Record intake review and architecture-only scope boundary.

### T2: Capture repo-local retrieval facts [completed]
- Inspect current knowledge retrieval, AI draft context assembly, Prisma schema, and CI database setup.
- Record facts in the architecture ADR.

### T3: Check external architecture facts [completed]
- Check PostgreSQL full-text search, pgvector, and pg_search/ParadeDB extension documentation.
- Treat deployability as a later readiness gate, not as already accepted runtime truth.

### T4: Write hybrid search ADR [completed]
- Add `docs/hybrid-search-architecture.md`.
- Define module boundaries, SearchIndexProfile invariants, fusion, fallback, risk, evidence, and follow-up mapping.

### T5: Validate and close [completed]
- Run `git diff --check`.
- Run targeted consistency checks.
- Write WT-078 gate evidence and closeout updates.
