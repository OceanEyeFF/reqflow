# Worktrack Contract: WT-20260528-048

## Metadata

- worktrack_id: WT-20260528-048
- title: zip 上传文件夹化修复
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
- snapshot_freshness: baseline `b2baeac` includes MS7 upload, parse, retrieval, and admin UI work.
- milestone_purpose_alignment: Repairs MS7 promised docs zip import behavior and makes zip imports manageable as folder-like source collections.
- historical_conflict_risk: Must not expand into multi-file upload or full folder model beyond zip-minimal repair; those belong to MS8.
- worktrack_adjustment_recommendations: Treat one zip as one source/folder with inner paths grouped and visible; keep storage private.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: b2baeac
- work_branch: worktrack/wt-20260528-048-zip-folder-upload-fix
- worktree_path: .worktrees/wt-20260528-048-zip-folder-upload-fix
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Fix zip upload behavior and expose zip imports in the admin knowledge UI as a folder-like source with manageable inner file paths.

### In Scope

- Diagnose and fix current zip upload/parse failure.
- Preserve docs-style zip path safety and supported file-type restrictions.
- Show zip import as a single manageable source/folder with inner file/path grouping or equivalent path hierarchy.
- Ensure parse, enable/disable, snippet preview, and citation metadata remain correct for zip entries.
- Add regression tests for zip upload/parse/UI-facing list behavior.

### Out of Scope

- Multiple separate file upload in one request.
- Full folder/group data model.
- Drag/drop directory upload.
- Semantic/vector retrieval, PostgreSQL/pgvector, PDF/DOCX/OCR.

## Acceptance Criteria

1. A safe docs-style zip can be uploaded and parsed without error.
2. Parsed zip entries preserve inner file paths and are visible in admin management as a folder-like source.
3. Unsafe zip paths or unsupported entries are still rejected.
4. AI citations from zip snippets include traceable source path metadata.
5. `npm run lint`, `npm run test`, and `npm run build` pass.
