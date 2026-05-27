# Plan / Task Queue: WT-20260527-039

## Metadata

- worktrack_id: WT-20260527-039
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect existing docs and code boundaries for admin roles, uploads, AI draft, and knowledge citation constraints. | ready | Evidence-backed design inputs |
| T2 | Create canonical MS7 knowledge-base upload product/permission contract doc. | ready | Contract covers permissions, upload limits, lifecycle, rollback, citations, non-goals |
| T3 | Cross-check doc against MS7 milestone acceptance and existing AI/upload governance. | pending | No contradiction with MS6/MS7 split and no public upload/PG scope creep |
| T4 | Run document-level validation and record gate evidence. | pending | `git diff --check` and review/policy evidence recorded |
| T5 | Close WT-039 and refresh RepoScope artifacts. | pending | Worktrack status and milestone progress updated after gate pass |

## Current Next Action

- selected_task_id: T1
- selected_task: Inspect existing docs and code boundaries for admin roles, uploads, AI draft, and knowledge citation constraints.
- dispatch_ready: true
- dispatch_package: Read `prisma/schema.prisma`, `src/auth`, current upload routes, `src/lib/ai`, docs for AI MVP/upload governance, and produce a concise boundary map before editing the design doc.

## Validation Plan

- `git diff --check`
- Targeted text search for contradictory scope statements.

## Return Conditions

- Return to scheduling if discovered code/docs make the current upload design scope inaccurate.
- Return to Harness if implementation decisions require programmer choice beyond MVP safety boundary.
