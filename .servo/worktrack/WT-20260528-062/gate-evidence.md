# Gate Evidence: WT-20260528-062

## Metadata

- worktrack_id: WT-20260528-062
- status: pending
- updated: 2026-05-28

## Validation Evidence

- `@prisma/client` install/generated check: passed in active checkout.
  - `node_modules/@prisma/client/default.js`: present.
  - `node_modules/.prisma/client/default.js`: present.
  - `npm ls @prisma/client --depth=0`: `@prisma/client@5.22.0`.
- Active `DATABASE_URL`: `.env` contains `DATABASE_URL="file:./dev.db"`; `prisma/dev.db` exists.
- `npx prisma validate --schema prisma/schema.prisma`: passed.
- `npx prisma migrate status --schema prisma/schema.prisma` with `DATABASE_URL=file:./dev.db`: passed; database schema is up to date.
- Active DB schema surface check: passed.
  - Tables include `KnowledgeBase`, `KnowledgeSource`, `KnowledgeSourceVersion`, `KnowledgeSnippet`, and `AiProviderConfig`.
  - `KnowledgeSource` includes `knowledgeBaseId`.
  - `KnowledgeBase` includes `id`, `name`, `slug`, `description`, `enabled`, `createdById`, `createdAt`, and `updatedAt`.
  - Default base exists: `id=default`, `slug=default`, `name=默认知识库`, `enabled=true`.
- Admin knowledge-base API readiness:
  - Unauthenticated `GET /api/admin/knowledge/bases` returned `401`, confirming the server route is reachable and no schema-related `500` occurs before auth.
  - Direct active DB reads through knowledge admin modules returned the default base and source count without Prisma/schema errors.
- Focused knowledge/API regression: passed, 5 files / 30 tests.
- `npm run lint`: passed.
- `npm run test`: passed, 27 files / 184 tests.
- `npm run build`: first attempt failed because `.next/dev/types/validator.ts` contained stale/corrupt dev-cache output. `.next` was confirmed under repo root, removed as a generated cache, and rerun passed.

## Database Safety Evidence

- Destructive commands avoided: no reset, drop, delete-many cleanup, seed overwrite, or broad data mutation was run for WT-062.
- Prior local active DB recovery, performed before this worktrack after the admin knowledge-base page surfaced schema drift:
  - `npx prisma migrate resolve --applied 20260527090000_add_ai_provider_config`
  - `npx prisma migrate resolve --applied 20260527093000_add_knowledge_uploads`
  - `npx prisma migrate resolve --applied 20260527100000_add_knowledge_snippets`
  - `npx prisma migrate deploy --schema prisma/schema.prisma`
- WT-062 verified that the active database is now up to date and contains the MS8 schema surfaces.

## Gate Verdict

- validation-gate: pass
- operator-db-readiness-gate: pass
- final_verdict: pass
