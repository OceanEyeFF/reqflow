# Worktrack Contract: WT-20260528-051

## Metadata

- worktrack_id: WT-20260528-051
- title: 多文件/zip 导入到知识库并保留路径层级
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-051-multi-file-folder-import
- baseline_branch: develop
- baseline_commit: 137c5a9fc1a45f85738e50e0d55aef688642e216
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: WT-20260528-052 introduced `KnowledgeBase`, default base compatibility, admin base API, and disabled-base retrieval exclusion.
- snapshot_freshness: current baseline is develop `137c5a9`; WT-052 closeout artifacts are merged.
- milestone_purpose_alignment: this worktrack uses the new knowledge-base boundary to import one or more files into a selected base while preserving zip inner paths already parsed by MS7 parser.
- historical_conflict_risk: medium; current upload API/UI assumes one `file` and one returned `source`.
- worktrack_adjustment_recommendations: preserve single-file API response while adding `files`/multiple file support and source array metadata.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Allow admins to select a knowledge base and upload multiple documents or zip archives in one action, while preserving existing zip path hierarchy in parsed snippets.

## In Scope

- Upload API accepts multiple `file` entries and creates one source/version per file in the selected knowledge base.
- Existing single-file upload behavior remains compatible and still returns `source`.
- Upload response includes `sources` for all created sources and per-upload metadata including `zipEntryCount`.
- Admin knowledge UI loads knowledge bases, lets admins select a target base, and supports multi-file selection.
- Existing zip path validation/parser behavior remains path-preserving and covered by tests.

## Out Of Scope

- Bulk selected deletion.
- AI discussion knowledge-base selection or retrieval filtering by selected base.
- Knowledge base rename/archive/delete/move/copy.
- Background import jobs, object storage, PDF/DOCX/OCR, PostgreSQL, pgvector, embeddings.

## Acceptance Criteria

1. Admin can upload multiple allowed documents/zip files in one request to an explicit knowledge base.
2. Non-admin upload restrictions remain unchanged.
3. Single-file upload clients remain compatible.
4. Zip snippets keep inner paths like `module-a/api/guide.md`.
5. Admin UI exposes knowledge-base target selection and multiple file selection.
6. `npm run lint`, `npm run test`, and `npm run build` pass, or Gate records a precise equivalent blocker.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: SubAgent explorer for read-only discovery; current-carrier for implementation.
