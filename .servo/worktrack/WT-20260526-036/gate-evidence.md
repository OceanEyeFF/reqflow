# Gate Evidence: WT-20260526-036

## Metadata

- worktrack_id: WT-20260526-036
- updated: 2026-05-27
- gate_round: 1
- required_evidence_lanes: implementation, validation, policy
- review_profile: ms6-final-validation

## Implementation Lane

### Control Signal

- implementation_result: pass
- confidence: high
- ready_for_gate: true
- changed_surfaces:
  - `src/lib/ai/draft-handoff.ts`
  - `src/lib/ai/draft-handoff.test.ts`
  - `src/app/(dashboard)/tickets/ai-discussion/page.tsx`
  - `src/app/(dashboard)/tickets/new/page.tsx`
  - `src/app/api/ai/draft/route.ts`
  - `src/app/api/ai/draft/route.test.ts`
  - `docs/ms6-ai-discussion-validation.md`
  - `.servo/worktrack/WT-20260526-036/*`

### Supporting Detail

- Draft handoff logic was extracted into `src/lib/ai/draft-handoff.ts`, making description formatting, browser staging, staged draft parsing, invalid draft cleanup, and manual clearing directly testable.
- Discussion page now calls the shared staging helper instead of duplicating `sessionStorage` serialization.
- New-ticket page uses `useSyncExternalStore` with an empty server snapshot and a client storage snapshot, avoiding server/client initial render mismatch while preserving AI draft prefill after mount.
- New-ticket page clears staged AI draft after successful manual ticket creation and still only creates tickets through the existing form submit.
- AI draft route now maps malformed JSON to `AiDraftValidationError`, returning HTTP 400 instead of a generic 500.
- Read-only sidecar review found no Critical or High issues. Medium/Low findings were addressed in this worktrack.

## Validation Lane

### Control Signal

- validation_result: pass
- confidence: high
- ready_for_gate: true

### Supporting Detail

- `git diff --check`: pass; Git reported expected CRLF normalization warnings only.
- `npm ci`: pass; npm emitted the existing plaintext registry notice.
- `npm run lint`: pass, ESLint 0 warnings.
- `npm run test`: pass, 15 files / 104 tests.
- `npm run build`: pass; `/tickets/ai-discussion`, `/tickets/new`, and `/api/ai/draft` are present in build output.
- Build warning: Next.js/Turbopack reports multiple lockfiles and inferred workspace root in the worktree; build still succeeds.
- Added test coverage:
  - malformed JSON on `POST /api/ai/draft` returns 400 and does not call provider.
  - draft handoff formats deterministic descriptions.
  - staged draft storage/readback works.
  - invalid staged draft payloads are rejected and cleaned.
  - staged draft manual discard works.

## Policy Lane

### Control Signal

- policy_result: pass
- confidence: high
- ready_for_gate: true
- violations: N/A

### Supporting Detail

- Worktree discipline followed: WT-036 work occurred in `.worktrees/wt-20260526-036-ai-discussion-validation`.
- Targeted search found no `NEXT_PUBLIC_DEEPSEEK*` exposure. Deepseek env reads remain in server-side provider code/tests/docs only.
- Official DeepSeek API docs were rechecked on 2026-05-27: `/chat/completions`, `deepseek-v4-flash`, `deepseek-v4-pro`, and JSON output are current for this implementation boundary.
- `POST /api/ai/draft` requires auth, maps validation/provider errors safely, and has no Prisma/ticket mutation dependency.
- Discussion UI calls only `/api/ai/draft` for AI generation; accepted drafts are browser-session staged and routed to `/tickets/new?from=ai-draft`.
- Existing `/api/tickets` usage remains in the manual new-ticket form submit path.
- Targeted MS7-scope search found no new administrator upload/docs zip import, knowledge ingestion, parsing/chunking, PostgreSQL, pgvector, embedding, vector database, semantic search, or migration implementation.
- Existing upload/zip hits are from pre-existing ticket attachments and documentation boundary notes, not MS6 AI knowledge scope.
- No real API keys, `.env` files, or production secret values were added.

## Evidence Assessment

### Control Signal

- node_type: test
- applied_gate_criteria: implementation + validation + policy
- implementation_gate: pass
- validation_gate: pass
- policy_gate: pass
- overall_confidence: high
- freshness_blockers: N/A

## Residual Risks

- No live Deepseek call was run because WT-036 must not require or expose a real API key.
- Production rate limiting/cost guard, billing setup, and secret-manager configuration remain deployment/operator decisions.
- Full browser E2E is not present; current confidence comes from unit/API/provider tests, static policy search, and production build.

## Recommended Next Route

### Control Signal

- allowed_next_routes: close WT-20260526-036, merge to `develop`, refresh Harness repo/milestone state, push and observe remote CI, then hand back MS6 for programmer acceptance decision.
- recommended_next_route: close this validation worktrack and hand back MS6.
- approval_required: false for worktrack close/merge under current delegated low-risk authority.
- milestone_acceptance_required_from_programmer: true
