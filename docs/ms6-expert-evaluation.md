# MS6 Expert Evaluation

## Scope

This evaluation covers `MS-20260526-002 / AI 需求生成 Discussion MVP` after the dedicated MS6 CodeReview worktrack. It assesses product fit, architecture fit, security/privacy posture, and operability before returning the milestone to programmer acceptance.

It does not replace the programmer's final milestone acceptance decision.

## Executive Verdict

MS6 has no expert-evaluation blocker.

The implemented slice is coherent for an MVP: a non-professional user can use a dedicated discussion surface, receive clarification questions or a structured ticket draft, review citations, explicitly accept the draft into the existing ticket form, and still submit only through the normal manual ticket creation flow.

Recommended route: return MS6 to final programmer acceptance handback with residual risks recorded for MS7 or later.

## Product Fit

### Assessment

Pass.

The MS6 product flow matches the intended non-professional requirement drafting job:

- `docs/ai-discussion-product-flow.md` defines a visible state machine from vague input to clarification, draft preview, staging, and manual ticket-form submission.
- `/tickets/ai-discussion` is documented as the work surface rather than a marketing entry page.
- The draft schema includes title, background, user story, acceptance criteria, pending questions, suggested priority, and citations.
- The handoff design keeps the final edit and create action in the existing `/tickets/new` form.

The MVP correctly optimizes for controlled drafting instead of autonomous ticket creation. That is the right product tradeoff for early AI assistance because it keeps user trust and auditability ahead of automation depth.

### Residual Product Risks

- There is no full browser E2E coverage for the complete discussion-to-ticket journey.
- Live provider behavior is not manually proven in CI because no production key should be required.
- The first MS6 knowledge source set is intentionally small, so draft quality may be limited until MS7 knowledge ingestion exists.

These are not MS6 blockers because the milestone is scoped as a controlled MVP and the UI/API flow already preserves manual confirmation.

## Architecture Fit

### Assessment

Pass.

The architecture is aligned with the milestone boundary:

- The browser depends on an internal ReqFlow API, not Deepseek-specific response shapes.
- `POST /api/ai/draft` and the provider adapter normalize generation into provider-neutral contracts.
- Deepseek key, base URL, model, and timeout remain server-side configuration.
- The knowledge strategy uses a static `rf-*` whitelist instead of scanning arbitrary repo files.
- Administrator upload, docs-style zip import, parsing/chunking, source/version records, PostgreSQL, pgvector, embeddings, and vector search are explicitly split to MS7 or later.

This is a defensible incremental architecture. It provides a provider boundary now while avoiding premature persistence and retrieval infrastructure.

### Residual Architecture Risks

- `DEEPSEEK_TIMEOUT_MS` is not positive-finite range validated, as recorded in `docs/ms6-code-review.md`.
- Provider configuration is still environment-driven; administrator-managed OpenAI-compatible endpoints, no-key local providers such as LMStudio/Ollama, and runtime validation belong to MS7.
- The static knowledge corpus is not enough for organization-scale knowledge quality, by design.

These risks should be deferred rather than fixed in MS6 because they either belong to MS7 scope or are low-severity provider configuration hardening.

## Security And Privacy Fit

### Assessment

Pass.

MS6 preserves the key safety boundaries:

- AI generation requires the authenticated internal route.
- Deepseek configuration is server-side only; there is no `NEXT_PUBLIC_DEEPSEEK*` exposure.
- Prompt input is redacted before provider calls.
- Static knowledge snippets exclude local artifacts, secrets, `.env` values, credentials, logs, backups, and untracked governance directories.
- Provider output cannot directly create or mutate tickets.
- Accepted AI drafts are staged in browser `sessionStorage` and require a final user action in the normal ticket form.
- Malformed draft request JSON is handled as a validation error.

The privacy posture is appropriate for an MVP because data sent to the provider is minimized to user discussion text, answers, and selected safe snippets.

### Residual Security/Privacy Risks

- User-accepted draft content remains in browser session storage until discarded, overwritten, or cleared after successful manual ticket creation.
- There is no production retention, audit, or operator-access policy for provider requests because MS6 does not persist AI requests.
- No production rate/cost control policy is finalized.

These do not block MS6 because no server-side AI history is introduced, ticket mutation remains manual, and the staged browser data is draft content already visible to the user.

## Operability Fit

### Assessment

Pass.

Operational behavior is sufficient for a development and controlled demo MVP:

- Missing Deepseek configuration returns an operator-safe failure instead of leaking secrets.
- CI does not require live provider credentials.
- Tests mock provider behavior and cover auth, weak input, malformed JSON, static knowledge, empty knowledge, and handoff helpers.
- `npm ci`, `npm run lint`, `npm run test`, and `npm run build` passed in the latest validation/code-review cycle.
- GitHub Actions run `26502063963` succeeded for the MS6 validation handback baseline.

The remaining deployment work is correctly outside MS6: real secret provisioning, billing, production model choice, hosted/local provider endpoint management, and admin-facing configuration.

### Residual Operability Risks

- No live Deepseek smoke test was executed.
- Local LMStudio/Ollama no-key endpoint support is not yet implemented.
- Production cost/rate limiting and model fallback decisions are not finalized.

These are acceptable as MS7/deployment follow-up items because MS6's CI and local validation intentionally avoid real secrets.

## Recommendation Matrix

| Area | Verdict | Blocker? | Follow-up |
|---|---|---:|---|
| Product flow | Accept | No | Add E2E coverage if the project adopts a browser runner. |
| Provider boundary | Accept | No | MS7 administrator provider config, including OpenAI-compatible endpoints and optional no-key local providers. |
| Knowledge strategy | Accept | No | MS7 administrator upload/docs zip import and lightweight retrieval. |
| Secret boundary | Accept | No | Deployment secret manager and operator policy. |
| Draft handoff | Accept | No | Later polish: clear invalid staged draft payloads when the new-ticket page detects them. |
| Timeout config | Defer | No | Validate positive finite timeout values during MS7 provider config work. |
| Live provider smoke | Defer | No | Run only in an environment with approved secrets. |

## Final Expert Decision

No MS6 final-acceptance blocker was found.

MS6 should return to programmer acceptance handback with these explicit residual risks:

1. Real provider smoke testing requires approved Deepseek credentials and should not be forced into CI.
2. Admin-configurable OpenAI-compatible endpoints, no-key local providers, and provider validation belong to MS7.
3. Admin knowledge-base upload/docs zip import and retrieval quality improvements belong to MS7.
4. Browser E2E coverage can be added later if the project standardizes on a browser test runner.
5. Low-severity cleanup items from `docs/ms6-code-review.md` remain non-blocking.
