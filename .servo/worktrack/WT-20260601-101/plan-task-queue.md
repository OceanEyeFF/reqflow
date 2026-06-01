# Plan / Task Queue: WT-20260601-101

## Metadata

- worktrack_id: WT-20260601-101
- status: active
- updated: 2026-06-01

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Add typed coverage diagnostics to AI search evidence and provider request shape | done | Safe derived fields are available to API response and provider request |
| T2 | Wire coverage diagnostics through knowledge assembly and draft service | done | Clarify provider calls receive coverage diagnostics without raw debug evidence |
| T3 | Add provider prompt payload coverage evidence | done | Deepseek request JSON includes coverageDiagnostics for clarify mode |
| T4 | Add focused tests for matched/missing terms, selected scope, vector lane status, lexical engine, and secret safety | done | Focused tests fail before implementation and pass after |
| T5 | Run validation and record gate evidence | done | Focused tests, lint/build as feasible, and diff check recorded |

## Current Next Action

- selected_task_id: N/A
- dispatch_ready: false
- dispatch_package: complete

## Context Budget

- must_read: `src/lib/ai/types.ts`, `src/lib/ai/knowledge.ts`, `src/lib/ai/draft-service.ts`, `src/lib/ai/deepseek-provider.ts`, `src/app/api/ai/draft/route.test.ts`, `src/lib/ai/draft-service.test.ts`, `src/lib/ai/deepseek-provider.test.ts`
- may_read: `src/lib/knowledge/retrieval.ts`, `src/app/(dashboard)/tickets/ai-discussion/page.tsx`
- do_not_read: provider secrets, `.env`, raw local backups, unrelated worktree directories
