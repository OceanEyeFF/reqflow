# MS6 Code Review

## Scope

This review covers `MS-20260526-002 / AI 需求生成 Discussion MVP`, focused on:

- `POST /api/ai/draft`
- Deepseek provider adapter
- draft service, redaction, and minimal knowledge snippets
- `/tickets/ai-discussion`
- AI draft handoff into `/tickets/new`
- MS6/MS7 boundary and test evidence

## Findings

No Critical or High issues found.

### Low: Invalid staged AI drafts are ignored but not cleared from session storage

- Location: `src/app/(dashboard)/tickets/new/page.tsx:65`
- Detail: the new-ticket page parses `storedAiDraft` with `parseStagedAiDraft`. If the stored value is invalid, the form falls back to empty state, but the invalid `sessionStorage` value is not removed because this page uses the non-mutating parser instead of `readStagedAiDraft`.
- Impact: low. It does not prefill unsafe data, does not create tickets, and does not expose secrets. It can leave stale invalid browser data until manually overwritten or cleared.
- Recommendation: acceptable for MS6; consider clearing invalid storage in a later UI polish pass or when the draft handoff helper is revisited.

### Low: Deepseek timeout environment value is not range-validated

- Location: `src/lib/ai/deepseek-provider.ts:37`
- Detail: `DEEPSEEK_TIMEOUT_MS` is converted with `Number(...)` and passed to `setTimeout`. A non-numeric or non-positive operator value can degrade timeout behavior.
- Impact: low for MS6. The default is safe, tests use valid values, and provider failures are wrapped into operator-safe 502 errors.
- Recommendation: acceptable for MS6; add positive finite timeout validation when provider configuration becomes administrator-managed in MS7.

## Verified Strengths

- `POST /api/ai/draft` authenticates before parsing and generation.
- Weak input and malformed JSON return 400.
- Provider configuration errors and provider failures do not leak secret values.
- Deepseek secret/config reads are server-side only.
- Discussion UI calls only `/api/ai/draft`; it does not call `/api/tickets`.
- Accepted AI drafts are staged in browser session storage and routed to `/tickets/new?from=ai-draft`.
- Final ticket creation remains the existing manual form submit to `/api/tickets`.
- Static knowledge snippets are source-controlled and do not implement MS7 upload/import scope.
- No PostgreSQL, pgvector, vector search, or admin knowledge upload implementation was introduced into MS6.

## Validation

- `npm ci`: pass; npm emitted the known plaintext registry notice and a non-fatal cleanup warning.
- `npm run lint`: pass, ESLint 0 warnings.
- `npm run test`: pass, 15 files / 104 tests. Initial run before `npm ci` failed because the new worktree lacked `node_modules/prisma/build/index.js`; rerun after `npm ci` passed.
- `npm run build`: pass; Next.js emitted the known worktree multiple-lockfile root warning.

## Verdict

MS6 has no CodeReview blocker. The two Low residual risks do not prevent returning to the MS6 expert evaluation worktrack.
