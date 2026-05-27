# Worktrack Contract: WT-20260527-041

## Metadata

- worktrack_id: WT-20260527-041
- title: 文档解析、分块、来源/版本记录
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 active; WT-039, WT-045, WT-040 completed; baseline branch `develop`.
- snapshot_freshness: repo baseline `f76342dae534000754a9698ecca69409fb2c4d2a` includes private raw upload metadata and storage.
- milestone_purpose_alignment: Implements MS7 completion signal 6 by parsing uploaded text/docs zip into traceable records and snippets.
- historical_conflict_risk: Must not introduce semantic/vector retrieval or send raw uploaded files wholesale to AI provider.
- worktrack_adjustment_recommendations: Keep to deterministic text parsing/chunking and source/version status transitions; retrieval ranking remains WT-042.
- add_remove_worktrack_recommendations: none.

## Baseline

- baseline_branch: develop
- baseline_ref: f76342dae534000754a9698ecca69409fb2c4d2a
- work_branch: worktrack/wt-20260527-041-kb-parse-versioning
- worktree_path: .worktrees/wt-20260527-041-kb-parse-versioning
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Parse uploaded text/docs zip sources into source/version/snippet records with traceable metadata and status transitions.

### In Scope

- Knowledge snippet schema if needed.
- Parser for stored `.md`, `.markdown`, `.txt`, `.json`, and safe docs zip entries.
- Deterministic chunking with source path/order metadata.
- Status transitions from `uploaded` to `ready` or `failed`.
- Tests for document parsing, zip multi-file parsing, failed parse behavior, and traceability.

### Out of Scope

- Retrieval ranking/selection for AI prompt context (WT-042).
- Admin UI management (WT-043).
- PostgreSQL/pgvector, embeddings, semantic search, OCR/PDF/DOCX.

## Acceptance Criteria

1. Uploaded raw records can be parsed into bounded snippets with source/version/path/order metadata.
2. Docs zip import records preserve inner source paths.
3. Failed parse leaves a failed status and no enabled snippets.
4. Parser does not read from `public/uploads` or expose raw storage paths.
5. `npm run lint`, `npm run test`, and `npm run build` pass.
