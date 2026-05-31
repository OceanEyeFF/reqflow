# Worktrack Contract: WT-20260531-099

## Metadata

- worktrack_id: WT-20260531-099
- title: MS-10 Lexical PostgreSQL FTS fallback 修复
- milestone_id: MS-10
- derived_from_worktrack: WT-20260531-097
- node_type: bugfix
- status: active
- priority: 8
- branch: worktrack/wt-20260531-099-lexical-fts-repair
- baseline_branch: develop
- baseline_ref: 23a65042db4a96d96e59f10f6775f6379e66095f
- created_at: 2026-05-31
- created_by: harness-kernel

## Scope

### In Scope

- Replace application-side newest-100 lexical prefiltering with database-side PostgreSQL FTS fallback recall.
- Preserve Chinese tokenization and matched-term debug evidence.
- Preserve enabled/archive/source/snippet/version/selected-knowledge-base filters.
- Add regression coverage for relevant snippets older than the previous newest-candidate window.
- Update review evidence to record blocker remediation.

### Out of Scope

- `pg_search`/BM25 integration.
- External search services.
- AI draft MS-11 integration.
- Embedding provider packaging decisions.

## Acceptance Criteria

1. Lexical retrieval executes PostgreSQL FTS fallback in the database before top result selection.
2. Relevant snippets are not dropped solely because they are outside the newest 100 snippets.
3. Existing MS-10 retrieval, hybrid, context, filter, and citation tests still pass.
4. Full local validation passes.
