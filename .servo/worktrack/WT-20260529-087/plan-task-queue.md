# Plan / Task Queue: WT-20260529-087

## Metadata

- worktrack_id: WT-20260529-087
- title: 权限过滤、Context Window Builder 与 citation 聚合
- milestone_id: MS-10
- branch: worktrack/wt-20260529-087-retrieval-filter-context-expansion
- status: seeded
- created_at: 2026-05-31

## Queue

### T1: Context Window Types

- status: completed
- task: Define context window, citation group, and expansion evidence shapes.
- acceptance: Evidence explains selected, adjacent, deduped, capped, and skipped snippets.

### T2: Expansion Runtime

- status: completed
- task: Build context windows from fused hits with adjacent chunk lookup and strict filters.
- acceptance: Expansion never introduces disabled/unselected/unready snippets.

### T3: Citation Aggregation

- status: completed
- task: Group context citations by source/path/section while preserving snippet provenance.
- acceptance: Aggregated citations are grounded in included snippets only.

### T4: Tests And Docs

- status: completed
- task: Add focused tests and docs for context builder behavior.
- acceptance: Tests cover filters, adjacency, dedupe, cap, and citation aggregation.

### T5: Validation

- status: completed
- task: Run required validation suite.
- acceptance: Gate evidence records command results.

## Current Next Action

- WT-087 validation passed; close and merge after final diff review.
