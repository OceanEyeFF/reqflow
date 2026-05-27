# Worktrack Contract: WT-20260526-038

## Metadata

- worktrack_id: WT-20260526-038
- title: Ticket 授权与上传安全加固
- milestone_id: MS-20260526-001
- derived_from_milestone: true
- node_type: refactor
- status: planned
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- repo_fundamentals: WT-20260526-037 rigorous CodeReview found blocking ticket object-level authorization gaps and a high-severity upload validation gap.
- snapshot_freshness: local baseline for the finding is `7805fe20c412597d3fd11cc7837846ca0747da36`; WT-037 review artifacts are expected to merge before this worktrack starts.
- milestone_purpose_alignment: required before MS5 final programmer acceptance because the current code quality/security baseline is not acceptable for handback.
- historical_conflict_risk: high; changes touch shared API authorization behavior and route tests.
- worktrack_adjustment_recommendations: keep scope to participant/admin ticket access checks, upload MIME/extension hardening, and focused route tests.
- add_remove_worktrack_recommendations: migration deploy/drift validation may become a separate future governance worktrack; do not mix it into this security hardening slice.
- intake_review_verdict: ready_for_worktrack_init_after_wt037_close
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: pending-after-WT-20260526-037-close
- work_branch: worktrack/wt-20260526-038-ticket-auth-upload-hardening
- worktree_path: .worktrees/wt-20260526-038-ticket-auth-upload-hardening

## Scope

### Goal

Fix the blocking ticket object-level authorization gaps and upload validation weakness found by WT-20260526-037.

### In Scope

- Add or reuse shared ticket access helpers for participant/admin authorization.
- Prevent non-admin `scope=all` from returning every ticket.
- Enforce participant/admin access for ticket detail, comments, attachments, logs, and member listing.
- Preserve stricter member mutation permissions where they already exist.
- Harden attachment upload validation so dangerous or mismatched extensions are rejected.
- Add focused API route tests for outsider denial and upload validation.
- Run `git diff --check`, `npm run lint`, `npm run test`, and `npm run build`.

### Out of Scope

- MS5 final acceptance.
- Production deployment, provider selection, production secrets, or paid service decisions.
- Gitee push or troubleshooting.
- PostgreSQL/pgvector migration, vector database implementation, or AI feature implementation.
- Prisma migration deploy/drift CI design, unless needed for test stability.
- Broad UI or product behavior changes unrelated to access control/upload validation.

## Typed Execution Policy

- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Non-admin `GET /api/tickets?scope=all` no longer returns tickets outside the current user's creator/assignee/member set.
- Non-participants receive `403` for ticket detail GET/PATCH and ticket comments/attachments/logs/members surfaces where access is not allowed.
- Admin users retain expected access.
- Existing creator/assignee/member flows continue to pass.
- Uploads reject dangerous public extensions and MIME/extension mismatches.
- Tests cover the fixed authorization and upload validation behavior.
- MS5 final acceptance remains explicitly pending.

## Verification Requirements

- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- targeted review that WT-037 blocker references are addressed
- changed-surface check confirming no database migration, AI, deployment, provider, secret, or Gitee scope changes

## Rollback Conditions

- The fix weakens existing notification ownership or member-management authorization.
- The fix breaks creator/assignee/member happy paths without replacement behavior.
- The worktrack expands into unrelated refactors or MS6 implementation.
