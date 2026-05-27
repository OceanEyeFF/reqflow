# Worktrack Contract: WT-20260528-049

## Metadata

- worktrack_id: WT-20260528-049
- title: 知识来源删除与全清补缺
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: fix
- status: planned
- created_at: 2026-05-28
- updated: 2026-05-28

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 reopened before final acceptance due to programmer upload UI feedback.
- snapshot_freshness: baseline `b2baeac` includes admin knowledge list/toggle UI but no delete or cleanup action.
- milestone_purpose_alignment: Completes MS7 administrator maintenance expectations for wrong uploads and stale knowledge cleanup.
- historical_conflict_risk: Deletion is higher risk than enable/disable; require admin-only boundary and explicit confirmation semantics.
- worktrack_adjustment_recommendations: Prefer source-level delete/archive and whole-knowledge clear with guarded confirmation; keep broad lifecycle expansion for MS8.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: b2baeac
- work_branch: worktrack/wt-20260528-049-knowledge-delete-cleanup
- worktree_path: .worktrees/wt-20260528-049-knowledge-delete-cleanup
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Add admin-only cleanup actions for deleting wrong knowledge uploads and clearing stale knowledge before MS7 acceptance.

### In Scope

- Single knowledge source delete or archive action from admin UI/API.
- Whole knowledge clear action for stale/old imported knowledge with explicit confirmation.
- Database consistency across source/version/snippet records.
- Private stored file cleanup strategy or documented fallback if physical cleanup is not safely implementable in MS7.
- Tests for admin-only delete/clear, confirmation validation, and retrieval exclusion after cleanup.

### Out of Scope

- Rich recycle bin, undo workflow, retention policy dashboard, scheduled cleanup, or bulk selection UI.
- Full MS8 batch delete/folder model.
- Deleting ticket attachments or unrelated uploads.

## Acceptance Criteria

1. Admin can remove a wrong knowledge source through a guarded UI/API path.
2. Admin can clear all imported knowledge through an explicit confirmation path.
3. Non-admin users cannot delete or clear knowledge.
4. Deleted/cleared snippets are no longer available to AI draft retrieval.
5. Private storage cleanup is handled or explicitly recorded as a bounded residual risk.
6. `npm run lint`, `npm run test`, and `npm run build` pass.
