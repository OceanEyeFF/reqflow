# Worktrack Contract: WT-20260527-043

## Metadata

- worktrack_id: WT-20260527-043
- title: 管理员知识库 UI
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 active; WT-039, WT-045, WT-040, WT-041, WT-042 completed; baseline branch `develop`.
- snapshot_freshness: repo baseline `1557b3b850548d1e86ef6fbffd14522609e9e99a` includes provider config, private upload intake, parsing/chunking, and lightweight citation selection.
- milestone_purpose_alignment: Implements MS7 completion signal 8 by giving administrators a usable UI to upload, parse, inspect, and manage knowledge sources.
- historical_conflict_risk: Must preserve admin-only access, private storage boundaries, masked secrets, and no vector/pgvector expansion.
- worktrack_adjustment_recommendations: Build a pragmatic admin page over existing API/service surfaces; add small API endpoints only when UI needs read/toggle actions that do not exist yet.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: 1557b3b850548d1e86ef6fbffd14522609e9e99a
- work_branch: worktrack/wt-20260527-043-admin-kb-ui
- worktree_path: .worktrees/wt-20260527-043-admin-kb-ui
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Provide an admin-only knowledge base management UI for uploading documents/zips, triggering parse, viewing source/version/snippet status, and enabling or disabling knowledge sources/snippets.

### In Scope

- Admin page for knowledge source list, upload form, version status, parse action, and snippet/citation preview.
- Admin-only read and update API endpoints if required by the UI.
- Source/snippet enable or disable controls using existing data model fields.
- Clear operator errors for rejected uploads, failed parses, unauthorized access, and disabled states.
- Tests for admin/non-admin access, upload/list/toggle/parse UI-facing APIs, and UI rendering where practical.

### Out of Scope

- PostgreSQL/pgvector, embeddings, vector database, semantic search.
- PDF/DOCX/OCR, object storage, cross-project knowledge base, bulk deletion, or production secret management.
- Changing AI provider configuration UI except for navigation/link consistency.
- Direct public exposure of raw uploaded files.

## Acceptance Criteria

1. Administrators can access a knowledge base UI and upload supported document or docs zip files.
2. Non-admin users cannot access or mutate knowledge base management surfaces.
3. Administrators can see sources, latest versions, parse status, snippet counts, and citation-relevant path/section preview.
4. Administrators can trigger parsing for uploaded versions and enable or disable sources/snippets.
5. UI/API errors are operator-safe and do not reveal private storage paths or secrets.
6. No upload path uses `public/uploads`, and no vector/pgvector/embedding infrastructure is introduced.
7. `npm run lint`, `npm run test`, and `npm run build` pass.
