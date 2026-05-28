# Worktrack Contract: WT-20260528-052

## Metadata

- worktrack_id: WT-20260528-052
- title: 多知识库模型与管理边界
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-052-knowledge-folder-model
- baseline_branch: develop
- baseline_commit: d448d4e3503a84c424fa5c0179ac6947ab7bfc50
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS7 accepted; admin knowledge upload/import, source/version/snippet, parser, retrieval, private storage and admin UI exist.
- snapshot_freshness: repo snapshot lags current HEAD, but MS8 requirement confirmation is present and this worktrack starts from develop HEAD d448d4e.
- milestone_purpose_alignment: this worktrack establishes the durable multi-knowledge-base model and admin boundary required before path-preserving import, selected deletion, and AI multi-select range work.
- historical_conflict_risk: medium; existing APIs assume source is the top-level management unit and tests seed source/version/snippet directly.
- worktrack_adjustment_recommendations: keep this slice to data model, admin base list/create, default base compatibility, and API metadata.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Introduce a first-class `KnowledgeBase` management boundary while preserving MS7 source/version/snippet behavior and default upload compatibility.

## In Scope

- Add Prisma model and migration for knowledge bases.
- Attach `KnowledgeSource` to a knowledge base.
- Provide admin-only API to list and create knowledge bases.
- Preserve existing upload behavior by routing uploads without explicit base selection into a default knowledge base.
- Return knowledge base metadata in admin source views and upload responses.
- Add focused API/model tests for admin-only base management and default base compatibility.

## Out Of Scope

- AI discussion page knowledge-base multi-select UI.
- Retrieval filtering by selected knowledge bases.
- Multi-file path preservation changes.
- Bulk selected deletion.
- Knowledge base rename, archive, move, copy, nested folders, or complex RBAC.
- PostgreSQL, pgvector, embeddings, object storage, or background queues.

## Acceptance Criteria

1. Admin can create multiple knowledge bases with unique slugs.
2. Non-admin users cannot list or create knowledge bases.
3. Existing upload API still works when no knowledge base is provided and creates/uses a default knowledge base.
4. Uploaded sources, versions, snippets, and admin source views expose traceable knowledge base identity without leaking private storage keys.
5. Existing source enable/delete/parse and retrieval compatibility remains intact.
6. `npm run lint`, `npm run test`, and `npm run build` pass, or Gate records a precise equivalent blocker.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- dispatch_policy_ref: docs/harness/foundations/dispatch-decision-policy.md
- carrier_decision: SubAgent explorer for read-only discovery; current-carrier for tightly coupled implementation integration.
- fallback_reason: N/A
