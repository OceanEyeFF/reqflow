---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
worktrack_id: "WT-20260523-016-ticket-modify-permission-hardening"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Gate Evidence

## Review Lane

- review_source: final CodeReview preflight found ordinary collaborators/watchers could still PATCH ticket mutable fields.
- static_review: pass; `canModifyTicket` limits PATCH to admin, creator, assignee, and owner-role collaborators.
- ui_review: pass; status buttons and assignee/priority selects are disabled for non-modifying collaborators.
- scope_review: pass; no schema, docs, or broad role matrix redesign.

## Validation Lane

- `npm run lint`: pass.
- `npm run build`: pass.
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`: pass.
- clean temp DB migrate + seed + `npm run smoke`: pass; smoke asserts collaborator status control is disabled and PATCH returns 403.

## Policy Lane

- worktree_policy: all edits occurred in `WT-20260523-016-ticket-modify-permission-hardening`.
- local_artifacts: no database or runtime logs staged.

## Recommended Next Route

- recommended_next_route: WorktrackScope.Close
- approval_required: false
