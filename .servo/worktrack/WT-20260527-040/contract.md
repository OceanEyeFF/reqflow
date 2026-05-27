# Worktrack Contract: WT-20260527-040

## Metadata

- worktrack_id: WT-20260527-040
- title: 文档/zip 上传安全与私有存储
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 active; WT-039 and WT-045 completed; baseline branch `develop`; no public upload storage or PostgreSQL/pgvector scope expansion.
- snapshot_freshness: repo baseline `0d4cfbcac7a6fb0453d6fea1a3d730aeda3d3d46` includes WT-045 merge.
- milestone_purpose_alignment: Implements the private upload and zip safety slice required by MS7 completion signals 4 and 5.
- historical_conflict_risk: Existing ticket attachments use `public/uploads`; this worktrack must not reuse that public path for knowledge uploads.
- worktrack_adjustment_recommendations: Keep as focused upload/private-storage implementation; parsing/chunking remains WT-041.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: 0d4cfbcac7a6fb0453d6fea1a3d730aeda3d3d46
- work_branch: worktrack/wt-20260527-040-kb-upload-private-storage
- worktree_path: .worktrees/wt-20260527-040-kb-upload-private-storage
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Add admin-only document/docs-zip upload handling for the knowledge base with private storage and hostile zip/path validation, without implementing parsing/chunking/retrieval.

### In Scope

- SQLite-compatible schema for knowledge source/version raw upload metadata if needed.
- Admin-only upload API for `.md`, `.markdown`, `.txt`, `.json`, and docs-style `.zip`.
- Private server-side storage outside `public/uploads`.
- File size/type validation and zip entry safety checks.
- Operator-safe upload result/status response.
- Tests for admin/non-admin, invalid type, oversized file, and zip path traversal.

### Out of Scope

- Parsing/chunking/snippet extraction beyond recording safe raw upload metadata.
- Knowledge retrieval, citations, UI management beyond API response basics.
- Object storage provider choice, PostgreSQL/pgvector, semantic search, PDF/DOCX/OCR.

## Acceptance Criteria

1. Admin can upload allowed document or docs-style zip through a server-side API.
2. Non-admin and unauthenticated users cannot upload.
3. Uploads are stored outside `public/uploads` and API responses do not expose raw filesystem paths.
4. Unsupported extensions, oversized files, nested archives, and path traversal zip entries are rejected.
5. Raw upload metadata is persisted with status suitable for WT-041 parsing.
6. `npm run lint`, `npm run test`, and `npm run build` pass.

## Verification Requirements

- Route tests for auth, admin, invalid type, oversized file, and zip traversal.
- Search for accidental `public/uploads` usage in knowledge upload code.
- `npm run lint`
- `npm run test`
- `npm run build`
