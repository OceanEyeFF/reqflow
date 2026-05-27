# Worktrack Contract: WT-20260527-039

## Metadata

- worktrack_id: WT-20260527-039
- title: 管理员知识库上传产品与权限设计
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 is active; MS6 is accepted; no active competing milestone; baseline branch is `develop`; no PostgreSQL/pgvector or public upload storage expansion is allowed by default.
- snapshot_freshness: repo snapshot/control state baseline is `b93935da269ed14ce85c28c799d0f4dd7cd9361c`; this init branch starts from `7e3000ceaaf04c9e18de384b495d3dc10aa7f082`, a control-plane-only commit after MS6 acceptance.
- milestone_purpose_alignment: This docs worktrack defines admin knowledge-base upload, permissions, version/status, rollback, and boundary decisions required before feature worktracks implement storage, parsing, retrieval, and UI.
- historical_conflict_risk: Avoid reopening MS6 discussion MVP scope; avoid implementing upload/provider code in this docs worktrack; preserve private-storage and no-PG/pgvector constraints.
- worktrack_adjustment_recommendations: Keep WT-039 as the first MS7 design slice; WT-045 may follow for provider configuration.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: 7e3000ceaaf04c9e18de384b495d3dc10aa7f082
- work_branch: worktrack/wt-20260527-039-admin-kb-upload-design
- worktree_path: .worktrees/wt-20260527-039-admin-kb-upload-design
- baseline_form: commit-on-docs-branch
- merge_required: yes
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Define the operator-facing product, permission, upload safety, version/status, and rollback contract for administrator-managed project knowledge base import before implementation work begins.

### In Scope

- Admin-only knowledge-base management roles and permission expectations.
- Supported MVP upload inputs and explicit non-goals.
- Private storage, file size/type, path traversal, and public exposure boundaries at the product-contract level.
- Knowledge source/version/status lifecycle: import, parsed, enabled/disabled, failed, rollback/retry.
- Citation/source traceability requirements for later AI draft use.
- Error handling and operator-visible recovery semantics.
- Handoff constraints for WT-040 through WT-044.

### Out of Scope

- Implementing upload endpoints, parser code, storage code, UI, retrieval, or AI provider settings.
- PostgreSQL/pgvector, embeddings, semantic retrieval, PDF/DOCX/OCR, object storage, cross-project knowledge bases.
- Returning or exposing uploaded raw content to non-admin users.

## Acceptance Criteria

1. A canonical docs artifact defines the MS7 knowledge-base upload product and permission contract.
2. The artifact states admin-only permissions and non-admin denial expectations.
3. The artifact defines MVP upload formats and explicitly excludes out-of-scope file families.
4. The artifact defines private storage and anti-path-traversal constraints without selecting unsafe implementation details.
5. The artifact defines knowledge source/version/status lifecycle and rollback/retry semantics.
6. The artifact defines how later AI draft citations must reference enabled knowledge snippets.
7. The artifact contains handoff notes for implementation worktracks and preserves MS7 no-PG/pgvector boundary.

## Verification Requirements

- Review the resulting doc against `.servo/milestone/MS-20260527-001.md`.
- Search for conflicts with existing AI MVP/docs and upload governance.
- `git diff --check`
- No build required unless implementation files are changed.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- preferred_carrier: current-carrier for docs edit; explorer SubAgent may be used for read-only codebase boundary mapping.

## Notes

- This worktrack intentionally front-loads product/security boundaries so later feature worktracks can avoid silent scope creep.
