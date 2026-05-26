# AI MVP Technical Brief

This document records the technical decision boundary for the first ReqFlow AI MVP. It is a pre-implementation brief, not an implementation plan or a provider purchase decision.

Checked against official OpenAI documentation on 2026-05-27:

- Latest model guide: https://developers.openai.com/api/docs/guides/latest-model
- Responses API migration guide: https://developers.openai.com/api/docs/guides/migrate-to-responses
- API authentication reference: https://developers.openai.com/api/reference/overview#authentication

## Decision Summary

The MS6 AI MVP should start as a lightweight, server-side draft-assistance workflow:

- Users provide existing ticket or requirement context.
- The AI produces a draft improvement, clarification, or rewrite.
- A human reviews, edits, and explicitly confirms before any ticket content is saved.
- The MVP uses curated project knowledge from tracked docs and selected ticket context.
- The MVP does not require PostgreSQL, pgvector, vector search, autonomous ticket mutation, or background agents.

## MVP Use Case

The first useful slice is requirement text improvement:

| Input | AI Output | Required Human Action |
|-------|-----------|-----------------------|
| Raw requirement text | Clearer requirement draft | Review and accept/edit |
| Existing ticket summary and comments | Suggested clarification questions | Choose which questions to keep |
| Ticket title and description | Structured acceptance checklist draft | Review and confirm before save |

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

If later retrieval quality requires semantic search, that should become a separate architecture worktrack with database, privacy, cost, and migration review.

## OpenAI Integration Boundary

Official OpenAI documentation currently recommends the Responses API for new projects, especially reasoning, tool-calling, and multi-turn workflows. ReqFlow should treat that as the default integration direction for the future implementation worktrack.

Initial implementation posture for MS6:

- Server-side only API calls.
- `OPENAI_API_KEY` supplied through environment variables or a server-side secret manager.
- No API key in browser code, committed files, screenshots, tickets, or docs.
- No client-side direct OpenAI requests.
- Default to a single request/response draft workflow before considering tools, background jobs, or multi-turn state.
- Keep model selection configurable so future OpenAI model guidance can be adopted without code churn.

The OpenAI latest-model guide identified `gpt-5.5` as current on 2026-05-27. The MVP should not hard-code that as a permanent product invariant. A future implementation worktrack should re-check the official model guide before setting the default model.

## Environment Variables

Future AI implementation may require:

| Variable | Purpose | Boundary |
|----------|---------|----------|
| `OPENAI_API_KEY` | Server-side OpenAI API authentication | Required only when AI implementation begins. Must never be exposed client-side. |
| `OPENAI_MODEL` | Operator-selected model slug | Optional; should have a documented default checked against current official docs. |

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
- Failure states for missing `OPENAI_API_KEY`, provider error, and rate/cost guard behavior.

The current WT-029 is documentation-only and does not add tests.

## Explicit Non-Goals

- No AI implementation in MS5.
- No OpenAI SDK installation in MS5.
- No production API key or secret creation in MS5.
- No paid plan or provider purchase decision in MS5.
- No PostgreSQL migration in MS5.
- No pgvector or vector database in MS5.
- No autonomous ticket mutation in the MVP boundary.
- No Gitee push requirement unless the user changes priority.

## Follow-Up Worktracks

Recommended MS6 sequence:

1. Product flow design for the AI draft assistant.
2. Curated project knowledge corpus and prompt boundary.
3. Server-side AI draft API with mocked tests and secret handling.
4. Frontend draft UI with explicit accept/edit/discard controls.
5. Safety and controllability checks.
6. AI MVP validation with representative tickets.
