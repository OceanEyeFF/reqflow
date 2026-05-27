# MS6 AI Discussion MVP Validation

## Scope

This report covers `MS-20260526-002 / AI 需求生成 Discussion MVP` after WT-031 through WT-036. It validates readiness for the programmer acceptance decision; it does not mark the milestone accepted.

## Acceptance Mapping

| MS6 criterion | Evidence |
|---|---|
| Discussion page can turn non-professional input into a structured draft | `/tickets/ai-discussion` calls authenticated `POST /api/ai/draft`, supports clarification and draft modes, and renders title, background, user story, acceptance criteria, pending questions, suggested priority, and citations. |
| Output includes required draft fields and citations | `src/lib/ai/types.ts`, `src/lib/ai/deepseek-provider.ts`, and the discussion page share the provider-neutral draft shape; static `rf-*` knowledge snippets are converted to draft citations. |
| AI does not directly create tickets | Discussion UI calls only `/api/ai/draft`; accepted drafts are staged in browser storage and routed to `/tickets/new?from=ai-draft`; final ticket creation remains the existing form submit to `/api/tickets`. |
| Deepseek calls and secret config are server-side | Deepseek config is read only in `src/lib/ai/deepseek-provider.ts`; `DEEPSEEK_API_KEY`, base URL, model, and timeout are not exposed through `NEXT_PUBLIC` variables. |
| No PostgreSQL/pgvector/admin upload/docs zip import in MS6 | WT-031/WT-032 documents exclude those surfaces; implementation uses static source-controlled snippets only and adds no migrations/vector/upload-import code for AI knowledge. |
| Existing ticket creation flow remains intact | `/tickets/new` still posts manually to `/api/tickets`; AI draft content is editable and can be cleared before submit. |
| Validation commands pass | `npm ci`, `npm run lint`, `npm run test` (15 files / 104 tests), and `npm run build` pass; see WT-036 gate evidence for full notes. |

## Security And Governance Checks

- Official DeepSeek API docs were rechecked on 2026-05-27: chat completion uses `POST /chat/completions`, current model IDs include `deepseek-v4-flash` and `deepseek-v4-pro`, and JSON output is enabled with `response_format: { "type": "json_object" }`. See https://api-docs.deepseek.com/api/create-chat-completion.
- `POST /api/ai/draft` requires authentication before parsing/generation.
- Weak input and malformed JSON are classified as bad requests.
- Provider configuration and provider failures return operator-safe messages that do not include secret values.
- Sensitive prompt input is redacted before provider calls.
- Deepseek provider uses an abort timeout and server-side configuration.
- Draft handoff is browser-session scoped and not persisted to the database.
- Staged AI drafts are cleared manually by the user or after successful manual ticket creation.
- Empty knowledge context is represented explicitly instead of faking citations.
- MS7 scope remains deferred: administrator uploads, docs zip import, parsing/chunking, source/version records, private storage, and expanded retrieval are not implemented here.

## Review Findings Triage

A read-only sidecar review found no Critical or High issues. Medium findings were addressed in WT-036:

- New-ticket AI prefill now happens after client mount to avoid server/client initial render mismatch.
- Draft handoff helper tests now cover staging, reading, invalid draft cleanup, manual discard, and deterministic description formatting.

Low findings were also addressed:

- Malformed AI draft request JSON now returns 400.
- Successful manual ticket creation clears `reqflow.aiDraft`.

## Residual Risks

- No live Deepseek smoke test is run because no real API key should be committed or required in CI.
- Production model, billing, secret manager, and rate/cost limits still require deployment-time operator decisions.
- UI interaction remains primarily validated through unit/policy checks and build output; full browser E2E can be added later if the project adopts a browser test runner.

## Programmer Acceptance Handback

MS6 is ready to be handed back for programmer acceptance decision after WT-036 gate evidence and remote CI observation are recorded. Final acceptance remains pending until the programmer explicitly approves it.
