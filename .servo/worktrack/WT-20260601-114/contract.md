# Worktrack Contract: WT-20260601-114

## Metadata

- worktrack_id: WT-20260601-114
- title: Build gate font network dependency recovery
- milestone_id: MS-12
- node_type: fix
- status: active
- created_at: 2026-06-01
- owner: codex

## Task Goal

Restore the local `npm run build` gate for MS-12 worktracks by removing the production build dependency on fetching Google Fonts at compile time.

## Scope

- Remove `next/font/google` usage from the root layout.
- Keep the existing global system font fallback in `src/app/globals.css`.
- Do not change page behavior, AI behavior, retrieval behavior, database schema, runtime environment variables, or provider configuration.

## Exclusions

- Do not add external font downloads or vendored font binaries.
- Do not change Tailwind/theme tokens beyond the font loading dependency.
- Do not claim this work satisfies any MS-12 business interrogation feature criterion.

## Acceptance Criteria

- `npm run build` passes without contacting Google Fonts.
- `npm run lint` passes.
- `npm run test` passes.
- `git diff --check` passes.

