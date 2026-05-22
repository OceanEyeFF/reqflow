---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
worktrack_id: "WT-20260522-008-notification-user-surface"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Gate Evidence

## Metadata

- worktrack_id: WT-20260522-008-notification-user-surface
- updated: 2026-05-23
- gate_round: 1
- required_evidence_lanes: test, review, policy
- review_profile: standard

## Review Lane

### Control Signal

- review_subagent_lanes: explorer discovery + current-carrier code review
- review_profile: standard
- confidence: high
- ready_for_gate: true
- residual_risks: notification freshness is request-time only; live polling/websocket delivery and preference settings remain out of scope.

### Supporting Detail

- input_ref: `.servo/worktrack/contract.md`
- freshness: current
- discovery_review: pass; explorer found existing notification APIs and helpers but no user-facing surface, and flagged the handoff method mismatch for later docs catch-up.
- static_semantic_review: pass; the header now exposes a client notification menu using existing `GET /api/notifications`, `PATCH /api/notifications/[id]`, and `PATCH /api/notifications/read-all` routes.
- ui_review: pass; screenshots show an unread badge/dropdown with two manager notifications and a post-click ticket detail page.
- test_review: pass; smoke creates a manager-assigned ticket, triggers a status-change notification, verifies unread count, single-read decrement, all-read clear, and ticket detail navigation.
- code_review: pass; read actions update local state only after successful API responses, historical notifications remain visible after all-read, and the ticket-link assertion now checks URL plus detail `h1`.
- project_security_review: pass for local scope; the menu reads only the current authenticated user's notifications through existing server-side session filters.
- missing_evidence: no mobile screenshot was captured in this worktrack; visual acceptance is reserved for the user per instruction.

## Validation Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: temp DB smoke validates deterministic seed behavior; local runtime DB may contain manual browsing drift and is intentionally excluded from evidence.

### Supporting Detail

- command_evidence:
  - `npm run lint`: pass.
  - `npm run build`: pass; Next.js build recognized the notification routes and dashboard pages.
  - `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`: pass.
  - clean temp DB `npx prisma migrate deploy`: pass; applied all three migrations to `prisma/.tmp-smoke/smoke.db`.
  - clean temp DB `npm run db:seed`: pass.
  - clean temp DB `npm run smoke`: pass; 1 Playwright test passed.
- screenshot_evidence:
  - `test-results/smoke/06-notifications-unread.png`: manager sees notification bell badge, unread count, and notification dropdown.
  - `test-results/smoke/07-notification-ticket-link.png`: notification link lands on the created ticket detail page.
- assertion_hardening: initial screenshot review found the old navigation check could pass on a dashboard ticket card title; the smoke test now requires `/tickets/{id}` URL and the detail page `h1`.

## Policy Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: local runtime artifacts must remain unstaged.

### Supporting Detail

- input_ref: `AGENTS.md`, `.servo/goal-charter.md`, `.servo/milestone/MS-20260522-003.md`
- worktree_policy: all scoped edits occurred in `WT-20260522-008-notification-user-surface`; main checkout was not edited.
- nextjs_docs_review: read installed Next.js 16 docs for Route Handlers, Server/Client Components, and Playwright before code changes.
- scope_control: no schema migration, external delivery channel, broad notification settings, or unrelated collaboration redesign was introduced.
- docs_sync: `docs/handoff.md` should be corrected from `POST /api/notifications/read-all` to `PATCH /api/notifications/read-all` during Repo refresh.

## Evidence Assessment

### Control Signal

- node_type: feature
- applied_gate_criteria: test + review + policy
- fallback_used: current-carrier implementation after explorer subagent discovery
- overall_confidence: high
- overall_confidence_reason: Browser-level evidence proves the user-facing notification loop, and static review confirms it stays within the existing authenticated notification API contract.
- freshness_blockers: N/A

## Recommended Next Route

### Control Signal

- allowed_next_routes: WorktrackScope.Judge, WorktrackScope.Close
- recommended_next_route: WorktrackScope.Close
- approval_required: false
- needs_programmer_approval: false
- why: WT-008 satisfies the notification user surface acceptance criteria for local runtime scope.
