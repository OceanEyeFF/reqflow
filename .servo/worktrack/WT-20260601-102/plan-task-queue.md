# Plan / Task Queue: WT-20260601-102

## Metadata

- worktrack_id: WT-20260601-102
- status: active
- updated: 2026-06-01

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current lexical retrieval and extension readiness evidence | done | Existing native FTS fallback and pg_search unavailable boundary understood |
| T2 | Add lexical engine descriptor abstraction | done | Retrieval evidence uses shared engine constants/capability metadata |
| T3 | Add focused tests for fallback vs BM25 readiness claims | done | Tests fail if active engine is mislabeled as BM25/pg_search |
| T4 | Add MS-12 readiness/design document | done | Design records current boundary and future pg_search runtime requirements |
| T5 | Run validation and record gate evidence | done | Tests/lint/build/search readiness/diff check recorded |
