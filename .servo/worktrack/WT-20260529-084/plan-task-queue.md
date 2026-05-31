# Plan / Task Queue: WT-20260529-084

## Metadata

- worktrack_id: WT-20260529-084
- status: initialized
- branch: worktrack/wt-20260529-084-lexical-bm25-fts-search
- baseline_ref: 586b942c8e2abba2a15c43e12b635e4675ffb44f

## Queue

| # | task | status | validation |
|---|------|--------|------------|
| 1 | Inspect current retrieval implementation and MS-9/MS-10 lexical requirements. | pending | Notes captured in gate evidence. |
| 2 | Add query understanding helper and typed lexical debug evidence. | pending | Focused tests cover output fields. |
| 3 | Implement PostgreSQL-native lexical retrieval fallback using metadata lexical text when available. | pending | Retrieval tests cover metadata and content fallback. |
| 4 | Preserve filters and citation grounding. | pending | Existing and new tests pass. |
| 5 | Run readiness, lint, tests, and build. | pending | Commands recorded in gate evidence. |
| 6 | Update artifacts and closeout evidence. | pending | Gate evidence and backlog updated. |

## Dispatch Seed

- recommended_next_scope: WorktrackScope
- recommended_next_function: Dispatch
- recommended_carrier: auto
- implementation_boundary: WT-084 contract only
- current_next_task: query understanding and lexical retrieval implementation

