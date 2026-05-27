# Plan / Task Queue: WT-20260527-043

## Metadata

- worktrack_id: WT-20260527-043
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current admin routes, upload/parse APIs, Prisma models, and UI conventions. | ready | UI/API integration points clear |
| T2 | Add admin knowledge read/update API endpoints as needed. | pending | Sources/snippets can be listed and toggled safely |
| T3 | Build admin knowledge base UI with upload, parse, status, and snippet preview controls. | pending | Admin workflow is usable |
| T4 | Add tests for admin/non-admin access and UI-facing behavior. | pending | Security and behavior covered |
| T5 | Run lint/test/build, scope scan, and record gate evidence. | pending | Gates pass |

## Current Next Action

- selected_task_id: T1
- dispatch_ready: true

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- scope scan for `pgvector|embedding|semantic|vector|public/uploads|NEXT_PUBLIC.*KEY`
