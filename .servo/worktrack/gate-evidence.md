---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
worktrack_id: "WT-20260522-007-attachment-end-to-end-validation"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Gate Evidence

## Metadata

- worktrack_id: WT-20260522-007-attachment-end-to-end-validation
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
- residual_risks: production object storage, malware scanning, and public sharing remain out of scope for MS-003 and should be covered by later operational readiness decisions.

### Supporting Detail

- input_ref: `.servo/worktrack/contract.md`
- freshness: current
- static_semantic_review: pass; attachment API now checks ticket access for list/upload/delete, and download uses an authenticated route instead of public static files.
- ui_review: pass; screenshots show an empty attachment card and an uploaded file row with size/uploader metadata and delete action.
- test_review: pass; smoke performs real upload, authenticated download, delete, and unauthenticated attachment API rejection.
- code_review: pass; local uploads are written under ignored `storage/uploads`, database-create failure attempts file cleanup, and delete removes the stored file then DB row.
- project_security_review: pass for local scope; related non-admin users are limited by creator/assignee/member checks, while admin retains broad access.
- missing_evidence: automated 403 login for an unrelated seeded user was not retained because the local validation DB is not guaranteed to contain that account; the 403 path is covered by helper-level code review.

## Validation Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: validation database required `prisma migrate deploy` because the local worktree DB initially lacked `TicketAttachment`.

### Supporting Detail

- command_evidence:
  - `npm run lint`: pass.
  - `npm run build`: pass; Next.js build recognized `/api/tickets/[id]/attachments/[attachmentId]/download`.
  - `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`: pass.
  - `$env:DATABASE_URL='file:./dev.db'; npx prisma migrate deploy`: pass; applied `20260517024330_add_ticket_attachments` to the local validation DB only.
  - `npm run smoke`: pass; 1 Playwright test passed.
- screenshot_evidence:
  - `test-results/smoke/02-ticket-detail.png`: empty attachment card visible.
  - `test-results/smoke/03-ticket-detail-attachments.png`: uploaded attachment visible with metadata and delete action.
- local_artifact_check: `storage/uploads` is empty after smoke delete flow; upload directory is ignored.

## Policy Lane

### Control Signal

- confidence: high
- ready_for_gate: true
- residual_risks: local database binary changed during validation and must be excluded from commit.

### Supporting Detail

- input_ref: `AGENTS.md`, `.servo/goal-charter.md`, `.servo/milestone/MS-20260522-003.md`
- worktree_policy: all scoped edits occurred in `WT-20260522-007-attachment-end-to-end-validation`; main checkout was not edited.
- nextjs_docs_review: read installed Next.js 16 docs for Route Handlers, Server/Client Components, and Playwright before code changes.
- scope_control: no schema migration, production storage strategy, broad redesign, or unrelated collaboration surface was introduced.

## Evidence Assessment

### Control Signal

- node_type: bugfix
- applied_gate_criteria: test + review + policy
- fallback_used: current-carrier implementation after explorer subagent discovery
- overall_confidence: high
- overall_confidence_reason: Browser-level evidence proves the user-visible attachment workflow, and static review covers authorization and storage behavior that smoke cannot fully exercise with current seed data.
- freshness_blockers: N/A

## Recommended Next Route

### Control Signal

- allowed_next_routes: WorktrackScope.Judge, WorktrackScope.Close
- recommended_next_route: WorktrackScope.Close
- approval_required: false
- needs_programmer_approval: false
- why: WT-007 satisfies the attachment workflow acceptance criteria for local runtime scope.
