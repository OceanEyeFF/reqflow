# Gate Evidence: WT-20260528-058

## Metadata

- worktrack_id: WT-20260528-058
- status: collecting
- updated: 2026-05-28

## Implementation Evidence

- Added `DraftAnswerLanguage` with `follow_input`, `zh`, and `en`.
- Draft request parsing defaults invalid or omitted language to `follow_input`.
- AI discussion page exposes `跟随输入 / 中文 / English` answer language controls.
- Draft requests send `answerLanguage`.
- Deepseek provider payload includes `answerLanguage` and explicit `languageInstruction`.

## Validation Evidence

- `git diff --check`: passed; line-ending warnings only.
- Targeted draft/provider tests: passed, 3 files / 18 tests.
- `npm run lint`: passed.
- `npm run test`: passed, 27 files / 180 tests.
- `npm run build`: passed. Non-blocking Next warning: worktree has an additional `package-lock.json`, so Next inferred root from the main checkout.

## Policy Evidence

- Worktree discipline followed: implementation performed in `.worktrees/wt-20260528-058-ai-draft-language-option`.
- Existing AI draft schema and ticket handoff shape unchanged.
- Provider secret boundary unchanged.
- MS8 scope respected: no multi-draft splitting, retrieval model changes, or post-processing translation introduced.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass
