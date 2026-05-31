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

- status: pending
- task: Define context window, citation group, and expansion evidence shapes.
- acceptance: Evidence explains selected, adjacent, deduped, capped, and skipped snippets.

### T2: Expansion Runtime

- status: pending
- task: Build context windows from fused hits with adjacent chunk lookup and strict filters.
- acceptance: Expansion never introduces disabled/unselected/unready snippets.

### T3: Citation Aggregation

- status: pending
- task: Group context citations by source/path/section while preserving snippet provenance.
- acceptance: Aggregated citations are grounded in included snippets only.

### T4: Tests And Docs

- status: pending
- task: Add focused tests and docs for context builder behavior.
- acceptance: Tests cover filters, adjacency, dedupe, cap, and citation aggregation.

### T5: Validation

- status: pending
- task: Run required validation suite.
- acceptance: Gate evidence records command results.

## Current Next Action

- Implement T1 and T2.
