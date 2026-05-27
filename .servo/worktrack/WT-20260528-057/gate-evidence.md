# Gate Evidence: WT-20260528-057

## Metadata

- worktrack_id: WT-20260528-057
- status: passed
- updated: 2026-05-28

## Review Evidence

- New ticket page now requires explicit AI draft confirmation before enabling `创建工单`.
- Loaded AI draft banner now includes `确认草稿` and `清除草稿`; confirmation is persisted in staged draft metadata.
- Ticket submit errors are rendered in-page instead of silently leaving the operator blocked.
- DeepSeek/OpenAI-compatible response normalization now accepts both top-level `questions` and nested `result.questions` for clarification output.

## Validation Evidence

- `npm run test -- src/lib/ai/deepseek-provider.test.ts src/lib/ai/draft-handoff.test.ts`: passed, 2 files / 12 tests.
- `npm run lint`: passed.
- `npm run test`: passed, 25 files / 159 tests.
- `npm run build`: passed. Non-blocking Next.js worktree multi-lockfile warning only.

## Policy Evidence

- Scope limited to AI draft handoff bugfix and clarification rendering bugfix.
- No language selection, multi-draft generation, docs cleanup, provider redesign, external API smoke test, or ticket API permission change included.
- Manual ticket creation boundary remains: AI output stages editable form data only; user still submits `/api/tickets`.

## Gate Verdict

- verdict: pass
- blockers: []
