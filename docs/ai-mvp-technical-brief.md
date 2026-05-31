# AI MVP Technical Brief

## Historical Scope Notice

This document is the MS5/MS6 AI MVP decision brief. It remains a historical design record for the first Deepseek-backed discussion MVP and manual-confirmation boundary.

Current operator truth has moved on: administrator knowledge-base import, PostgreSQL provider migration, pgvector readiness, hybrid retrieval, citation provenance, admin debug evidence, and AI draft hybrid context integration are now covered by MS7, MS9, MS10, and MS11. Use `docs/operator-hybrid-search-ai-draft.md` for the current AI draft and retrieval runbook.

This document records the technical decision boundary for the first ReqFlow AI MVP. It is a pre-implementation brief and has been updated after the programmer selected Deepseek as the AI provider.

Original MS5 provider research checked official OpenAI documentation on 2026-05-27:

- Latest model guide: https://developers.openai.com/api/docs/guides/latest-model
- Responses API migration guide: https://developers.openai.com/api/docs/guides/migrate-to-responses
- API authentication reference: https://developers.openai.com/api/reference/overview#authentication

MS6 provider decision checked against official DeepSeek documentation on 2026-05-27:

- DeepSeek API quick start: https://api-docs.deepseek.com/
- DeepSeek API reference: https://api-docs.deepseek.com/api/deepseek-api
- DeepSeek model list reference: https://api-docs.deepseek.com/api/list-models

## Decision Summary

The MS6 AI MVP should start as a lightweight, server-side Deepseek-backed discussion workflow:

- Users open an AI requirement-generation discussion page and describe a vague requirement.
- The AI can ask clarification questions and then produce a structured ticket draft.
- A human reviews, edits, and explicitly confirms before any ticket content is saved.
- The MVP uses repo-stable docs or a small built-in corpus as inspectable knowledge context.
- Administrator-maintained knowledge-base upload and docs-style zip import are split into MS7.
- The MVP does not require PostgreSQL, pgvector, vector search, autonomous ticket mutation, or background agents.

## MVP Use Case

The first useful slice is requirement discussion to ticket draft:

| Input | AI Output | Required Human Action |
|-------|-----------|-----------------------|
| Raw requirement text | Clarifying questions | Answer, skip, or edit |
| Discussion context | Structured ticket draft | Review and accept/edit |
| Draft plus knowledge snippets | Acceptance criteria and open questions | Confirm before ticket flow |

The MVP should optimize for controllability and traceability over automation depth.

## Manual Confirmation Boundary

AI output is advisory until the user confirms it.

Required product boundary:

- Never overwrite ticket fields automatically.
- Show generated text as a draft or suggestion.
- Require an explicit user action before saving AI-assisted content.
- Preserve normal ticket audit behavior for accepted changes.
- Make it clear which final text came from a human-approved action.

Out of scope for the MVP:

- Autonomous ticket creation or mutation.
- Automatic status transitions.
- AI-initiated collaborator changes.
- AI-triggered notifications beyond normal user-confirmed ticket updates.

## Knowledge Source Boundary

The first MVP should use simple, inspectable context assembly instead of vector infrastructure.

Allowed MVP sources:

- Current ticket title, description, status, priority, comments, members, and logs when relevant.
- Tracked project docs such as `README.md`, `docs/handoff.md`, `docs/api-route-testing.md`, `docs/cloud-readiness-boundary.md`, and this brief.
- Small curated prompt snippets stored as source-controlled text if a later implementation worktrack approves them.

Not required for the MVP:

- Embedding pipelines.
- pgvector.
- Dedicated vector database.
- Background indexing.
- Cross-project knowledge ingestion.
- Upload-content parsing.
- Administrator document upload.
- Docs-style zip import.

Administrator-maintained knowledge-base upload, private storage, parsing, chunking, source/version records, and lightweight retrieval are planned for `MS-20260527-001 / 管理员项目知识库管理与导入`.

If later retrieval quality requires semantic search, that should become a separate architecture worktrack with database, privacy, cost, and migration review.

## Deepseek Integration Boundary

The programmer selected Deepseek as the provider for MS6. Implementation worktracks must check Deepseek official API documentation before coding provider-specific endpoint, model, authentication, streaming, timeout, and error handling details.

Official DeepSeek docs currently identify:

- OpenAI-compatible base URL: `https://api.deepseek.com`
- Authentication: Bearer token
- Current model examples: `deepseek-v4-flash` and `deepseek-v4-pro`
- Legacy model names `deepseek-chat` and `deepseek-reasoner` are marked for deprecation on 2026-07-24 in the quick-start docs.

Initial implementation posture for MS6:

- Server-side only API calls.
- `DEEPSEEK_API_KEY` supplied through environment variables or a server-side secret manager.
- No API key in browser code, committed files, screenshots, tickets, or docs.
- No client-side direct Deepseek requests.
- Default to a discussion-to-draft workflow before considering background jobs or autonomous actions.
- Keep provider adapter, base URL, model, timeout, and rate/cost guards configurable.
- Frontend and business logic must depend on an internal provider-neutral draft contract, not Deepseek-specific response shapes.

## Environment Variables

Future AI implementation may require:

| Variable | Purpose | Boundary |
|----------|---------|----------|
| `DEEPSEEK_API_KEY` | Server-side Deepseek API authentication | Required only when real provider calls begin. Must never be exposed client-side. |
| `DEEPSEEK_BASE_URL` | Deepseek-compatible API base URL | Optional; defaults must be checked against official docs during implementation. |
| `DEEPSEEK_MODEL` | Operator-selected model slug | Optional; should have a documented default checked against current official docs. |

Do not add these variables to committed `.env` files. If examples are added later, they must use placeholder values only.

## Data And Privacy Boundary

The MVP should send the minimum context needed for a useful draft:

- Prefer title, description, and selected comments over full ticket history.
- Avoid sending attachment binaries in the first MVP.
- Avoid sending secrets, credentials, cookies, or environment values.
- Add a server-side redaction pass before provider calls in the implementation worktrack.
- Log provider request metadata only when it is useful for debugging and does not store sensitive content.

Any future production rollout should define retention, audit, and operator access policy before broad use.

## Persistence Boundary

AI draft generation does not require a database migration.

Allowed first step:

- Generate draft text on demand.
- Save only the final human-confirmed ticket changes through existing ticket update flows.

Deferred persistence:

- Prompt/version registry.
- AI draft history.
- Provider request/response archive.
- Token/cost ledger.
- Evaluation dataset.

Those deferred items may need schema changes later, but they are not prerequisites for the lightweight MVP.

## Testing Boundary

The future implementation worktrack should include tests before acceptance:

- API authorization checks for any AI endpoint.
- No client exposure of provider secrets.
- Mocked provider responses for deterministic route tests.
- Manual-confirmation flow coverage: generated draft does not save until accepted.
- Failure states for missing `DEEPSEEK_API_KEY`, provider error, and rate/cost guard behavior.

The current WT-029 is documentation-only and does not add tests.

## Explicit Non-Goals

- No AI implementation in MS5.
- No Deepseek SDK/provider package installation in MS5.
- No production API key or secret creation in MS5.
- No paid plan or provider purchase decision in MS5.
- No PostgreSQL migration in MS5.
- No pgvector or vector database in MS5.
- No autonomous ticket mutation in the MVP boundary.
- No administrator knowledge-base upload or docs-style zip import in MS6; this is MS7 scope.
- No Gitee push requirement unless the user changes priority.

## Follow-Up Worktracks

Recommended MS6 sequence:

1. Discussion product flow and information architecture.
2. Minimal built-in knowledge corpus and citation strategy.
3. Deepseek draft API and provider adapter with mocked tests and secret handling.
4. AI requirement-generation discussion page UI.
5. Draft confirmation and existing ticket form handoff.
6. Safety governance, tests, and MS6 validation.

Recommended MS7 sequence:

1. Administrator knowledge-base upload product and permission design.
2. Document/docs-zip upload security and private storage.
3. Document parsing, chunking, source/version records.
4. Lightweight retrieval and citation snippet selection.
5. Administrator knowledge-base UI.
6. Knowledge-base import validation and security regression.
