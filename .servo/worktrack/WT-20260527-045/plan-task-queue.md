# Plan / Task Queue: WT-20260527-045

## Metadata

- worktrack_id: WT-20260527-045
- status: active
- updated: 2026-05-27

## Queue

| id | task | status | acceptance_slice |
|----|------|--------|------------------|
| T1 | Inspect current AI provider, auth, Prisma, and admin role patterns. | ready | Implementation inputs identified |
| T2 | Add persisted AI Provider configuration schema and server-side secret masking strategy. | ready | Admin-configurable endpoint/model/key/no-key mode stored safely |
| T3 | Add admin-only API routes for view/update/test connection. | pending | Non-admin denied; plaintext key never returned |
| T4 | Wire draft generation to configured provider while preserving env fallback or documented migration behavior. | pending | Existing AI draft tests updated |
| T5 | Add admin UI entry for provider configuration. | pending | Admin can manage config; non-admin cannot access controls |
| T6 | Run lint/test/build and record gate evidence. | pending | Quality gates pass |

## Current Next Action

- selected_task_id: T1
- selected_task: Inspect current AI provider, auth, Prisma, and admin role patterns before implementation.
- dispatch_ready: true
- dispatch_package: Read `src/lib/ai/*`, `src/app/api/ai/draft/route.ts`, `prisma/schema.prisma`, auth helpers, and route tests. Then implement the smallest coherent provider config slice.

## Validation Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Targeted search for plaintext key exposure and `NEXT_PUBLIC` misuse.

## Return Conditions

- Hand back if provider secret encryption/key management requires a decision beyond MVP masking/local SQLite storage.
- Hand back before destructive schema/data reset or external provider calls.
