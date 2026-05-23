---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
worktrack_id: "WT-20260522-009-member-comment-interaction-hardening"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Gate Evidence

## Metadata

- worktrack_id: WT-20260522-009-member-comment-interaction-hardening
- updated: 2026-05-23
- gate_round: 1
- required_evidence_lanes: test, review, policy
- review_profile: standard

## Review Lane

### Control Signal

- review_subagent_lanes: two explorer discoveries + current-carrier code review
- review_profile: standard
- confidence: high
- ready_for_gate: true
- residual_risks: member/comment writes are still local-app operations; production audit/transaction policy and richer role semantics remain out of scope.

### Supporting Detail

- input_ref: `.servo/worktrack/contract.md`
- freshness: current
- discovery_review: pass; explorers identified missing access checks for ticket detail/comments/members, POST member role whitelist gap, UI inaccessible controls, silent errors, and missing smoke coverage.
- static_semantic_review: pass; ticket detail, comments, and members now use `canAccessTicket`; member modification permits admin/creator/assignee/owner; `POST /members` validates role and rejects duplicate creator/assignee membership.
- ui_review: pass; ticket detail has accessible comment submit, member add role selector, per-member role selector, member remove labels, and visible error alerts.
- test_review: pass; smoke covers non-member 403 for ticket/detail/comments/members, admin member add/update/comment, member notification navigation, and member comment visibility.
- code_review: pass; role constants now include `member_role_changed`, and the operation log renders member role changes.
- project_security_review: pass for local scope; non-participant read/write collaboration access is blocked, while admin policy is explicit and consistent with existing admin access.
- missing_evidence: no direct automated invalid-role POST assertion was added; role whitelist is covered by code review and UI only emits known roles.

## Validation Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: smoke remains one integrated path; a future test split would improve failure localization.

### Supporting Detail

- command_evidence:
  - `npm run lint`: pass.
  - `npm run build`: pass.
  - `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`: pass.
  - clean temp DB `npx prisma migrate deploy`: pass.
  - clean temp DB `npm run db:seed`: pass.
  - clean temp DB `npm run smoke`: pass; 1 Playwright test passed.
- screenshot_evidence:
  - `test-results/smoke/04-member-comment-hardening.png`: admin sees member role changed to collaborator, admin comment, and member action logs.
  - `test-results/smoke/05-member-comment-visible.png`: added member opens the ticket, sees existing comments, and adds a member comment.
- cleanup_evidence: smoke removes its added comments, member row, and sample-ticket notifications created after the test start timestamp.

## Policy Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: local runtime artifacts must remain unstaged.

### Supporting Detail

- input_ref: `AGENTS.md`, `.servo/goal-charter.md`, `.servo/milestone/MS-20260522-003.md`
- worktree_policy: all scoped edits occurred in `WT-20260522-009-member-comment-interaction-hardening`; main checkout was not edited.
- nextjs_docs_review: read installed Next.js 16 docs for Route Handlers and Server/Client Components before code changes.
- scope_control: no schema migration, broad role redesign, external notification channel, or comment edit/delete feature was introduced.
- docs_sync: `WT-20260522-010-collaboration-docs-catch-up` should record the accepted member/comment behavior and local boundaries.

## Evidence Assessment

### Control Signal

- node_type: bugfix
- applied_gate_criteria: test + review + policy
- fallback_used: current-carrier implementation after explorer subagent discovery
- overall_confidence: high
- overall_confidence_reason: Browser-level evidence proves the accepted user flows, and API-level smoke assertions prove the key non-participant denial path.
- freshness_blockers: N/A

## Recommended Next Route

### Control Signal

- allowed_next_routes: WorktrackScope.Judge, WorktrackScope.Close
- recommended_next_route: WorktrackScope.Close
- approval_required: false
- needs_programmer_approval: false
- why: WT-009 satisfies the member/comment hardening acceptance criteria for local runtime scope.
