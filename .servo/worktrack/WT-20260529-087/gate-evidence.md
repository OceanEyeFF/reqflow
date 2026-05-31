# Gate Evidence: WT-20260529-087

## Metadata

- worktrack_id: WT-20260529-087
- title: 权限过滤、Context Window Builder 与 citation 聚合
- milestone_id: MS-10
- branch: worktrack/wt-20260529-087-retrieval-filter-context-expansion
- status: gate-passed

## Implementation Evidence

- Added `buildHybridContextWindow()` in `src/lib/knowledge/retrieval.ts`.
- Context expansion consumes hybrid fused hits, then reloads selected and adjacent snippets through Prisma filters.
- Adjacent expansion is constrained to same source/version/path and configurable chunk distance.
- Expansion re-enforces enabled knowledge-base, enabled/ready source, enabled snippet, ready version, and selected knowledge-base filters.
- Context output includes `contextText`, grounded citations, grouped citations, and context window evidence.
- Evidence records included snippets, selected vs adjacent reasons, deduped ids, capped ids, skipped ids, max chars, and adjacent chunk configuration.
- Added focused tests for adjacent expansion, disabled adjacent filtering, context caps, selected knowledge-base filter preservation, and citation grouping.
- Added `docs/ms10-context-window-builder.md`.
- Consumed read-only review findings and fixed selected-hit preservation under tight caps plus separator-inclusive context cap enforcement.

## Validation Evidence

- `npm ci`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx prisma generate --schema prisma/schema.prisma`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npx vitest run src/lib/knowledge/retrieval.test.ts`: pass, 1 file / 25 tests.
- `npm run lint`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run postgres:readiness`: pass.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run test`: pass, 30 files / 234 tests.
- `npm run build`: pass; known worktree multi-lockfile warning only.

## Policy Review

- Scope stayed within context window builder, citation aggregation, focused tests, and docs.
- AI draft integration, admin debug UI, and broad evaluation harness expansion remain deferred.
- Expansion does not bypass retrieval filters.
- Citation groups are built from included snippets only.
- Selected fused hits are prioritized before adjacent chunks under context caps.
- Separator characters are counted when enforcing the max context size.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
