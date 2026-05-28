# Gate Evidence: WT-20260528-064

## Metadata

- worktrack_id: WT-20260528-064
- title: 知识库编辑与禁用归档
- milestone_id: MS-20260528-003
- node_type: feature
- collected_at: 2026-05-28
- branch: worktrack/wt-20260528-064-knowledge-base-edit-archive

## Implementation Evidence

- Added admin knowledge-base lifecycle helper functions in `src/lib/knowledge/bases.ts`.
- Added `PATCH /api/admin/knowledge/bases/[id]` for editing name/description/enabled while rejecting slug updates.
- Reused `KnowledgeBase.enabled=false` as disabled/archive semantics; no Prisma schema change.
- Protected default knowledge base from being disabled.
- Hardened upload target resolution so disabled bases cannot receive new uploads, including default fallback validation.
- Hardened cleanup helpers so single delete, selected delete, and full clear reject sources under disabled bases.
- Updated admin UI to show knowledge-base lifecycle controls, immutable slug, disabled state, edit form, disable/restore action, upload target filtering, and disabled cleanup controls.

## Validation Evidence

- `npm run lint`: pass.
- Focused tests: pass, 6 files / 47 tests.
  - `src/app/api/admin/knowledge/bases/[id]/route.test.ts`
  - `src/app/api/admin/knowledge/uploads/route.test.ts`
  - `src/app/api/admin/knowledge/sources/[id]/route.test.ts`
  - `src/app/api/admin/knowledge/sources/route.test.ts`
  - `src/app/api/knowledge/bases/route.test.ts`
  - `src/lib/knowledge/retrieval.test.ts`
- `npm run test`: pass, 28 files / 193 tests.
- `npm run build`: pass.
  - Note: Next.js emitted a worktree root inference warning because the worktree has its own `package-lock.json`; build completed successfully.

## Policy Evidence

- No destructive deletion or database reset was performed.
- No Prisma schema or migration was changed.
- Internal slug/system identifier remains immutable after create.
- Default knowledge base cannot be disabled through the new lifecycle route.
- Disabled/archived knowledge-base content is not cleaned until the base is restored.
- Milestone final acceptance remains fdch0-only.

## Gate Verdict

- implementation_gate: pass
- validation_gate: pass
- policy_gate: pass
- final_verdict: pass
