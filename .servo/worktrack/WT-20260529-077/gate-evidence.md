# Gate Evidence: WT-20260529-077

## Metadata

- worktrack_id: WT-20260529-077
- gate_result: pass
- recorded_at: 2026-05-29
- branch: worktrack/wt-20260529-077-ai-clarification-visible

## Reproduction Evidence

- Playwright used fdch0's “一般耗材标准检验出库” prompt on `http://127.0.0.1:4000/tickets/ai-discussion`.
- All visible knowledge bases were selected.
- `POST /api/ai/draft` returned 200 with empty `questions` and empty direction question arrays.
- Before-fix screenshot captured as `ai-clarification-before-fix.png`; page showed citations but no visible “AI 追问” area.

## Implementation Evidence

- `src/lib/ai/deepseek-provider.ts` now inserts one fallback question per fixed clarification direction when the provider returns zero questions.
- `src/app/(dashboard)/tickets/ai-discussion/page.tsx` now shows the clarification card whenever `status === "clarifying"`, includes a status message and question count, and exposes selected knowledge-base count / select-all control.
- Fixed direction labels and per-question answers remain unchanged.

## Validation Evidence

- `npx vitest run src/lib/ai/deepseek-provider.test.ts src/app/api/ai/draft/route.test.ts`: pass, 17 tests.
- `npm run lint`: pass, ESLint 0 warnings.
- First `npm run test`: failed because the new worktree had incomplete ignored `node_modules` and was missing `node_modules/prisma/build/index.js`; no source failures were reported.
- `npm install`: completed in the worktree to restore ignored dependencies for validation.
- `npm run test`: pass, 28 files, 201 tests.
- `$env:DATABASE_URL='file:./dev.db'; npm run build`: pass. Next.js emitted only a worktree root inference warning due multiple lockfiles.
- `git diff --check`: pass, with CRLF conversion warnings only.

## Gate Decision

Pass. The fix is scoped to MS8 addendum acceptance feedback and does not change retrieval architecture, ticket creation, provider configuration, or the AI human-confirmation boundary.
