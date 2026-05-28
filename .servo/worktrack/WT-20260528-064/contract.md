# Worktrack Contract: WT-20260528-064

## Metadata

- worktrack_id: WT-20260528-064
- title: 知识库编辑与禁用归档
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: feature
- status: completed
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-064-knowledge-base-edit-archive
- baseline_branch: develop
- baseline_commit: 937836b62c165b519ed2d667b0a4d9184ff10840
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS8 addendum is active; execution cycle authorized by fdch0 with 30 Worktrack quota.
- snapshot_freshness: repo baseline refreshed to `937836b62c165b519ed2d667b0a4d9184ff10840`.
- milestone_purpose_alignment: implements knowledge-base lifecycle management portion of MS8 addendum.
- historical_conflict_risk: low; existing `KnowledgeBase.enabled` already supports user-invisible disabled bases.
- worktrack_adjustment_recommendations: no worktrack recomposition required; absorb confirmed constraints into WT-064 contract.
- add_remove_worktrack_recommendations: none for this slice.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Allow administrators to edit knowledge-base display metadata and disable/restore a knowledge base using the existing `enabled` state, while preserving immutable internal slug/system identifiers and protecting default/disabled knowledge-base content from destructive operations.

## In Scope

- Add admin API support for editing `name`, `description`, and `enabled`.
- Keep `slug` / internal system identifier immutable after creation.
- Protect the default knowledge base from deletion and destructive disable/delete semantics.
- Treat disabled/archived knowledge bases as user-invisible and unavailable for upload targets.
- Reject source deletion, bulk deletion, and full clear operations for disabled/archived knowledge bases until restored.
- Update admin UI to show knowledge-base lifecycle controls and disable unsafe actions.
- Add tests for server-side lifecycle and cleanup protections.

## Out Of Scope

- Adding new Prisma fields such as `archivedAt` or `status`.
- Physical deletion of non-empty knowledge bases.
- Changing AI multi-direction clarification behavior; that is WT-20260528-065.
- Milestone final acceptance; fdch0 retains that decision.

## Acceptance Criteria

1. Admins can edit knowledge-base name and description without changing slug/system identifier.
2. Admins can disable and restore non-default knowledge bases.
3. Default knowledge base cannot be disabled or deleted.
4. Disabled/archived knowledge bases cannot receive new uploads and are not listed as ordinary user AI choices.
5. Disabled/archived knowledge-base sources cannot be deleted via single delete, selected delete, or broad clear helpers until the base is restored.
6. Admin UI shows disabled state, prevents disabled upload targets, and disables destructive source cleanup for disabled bases.
7. Focused tests cover API lifecycle, disabled upload rejection, and cleanup rejection.

## Validation Requirements

- `npm run lint`
- `npm run test`
- `npm run build`
- Focused route/lib tests for changed lifecycle behavior
