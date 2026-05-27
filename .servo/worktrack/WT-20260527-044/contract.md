# Worktrack Contract: WT-20260527-044

## Metadata

- worktrack_id: WT-20260527-044
- title: 知识库导入验收与安全回归
- milestone_id: MS-20260527-001
- derived_from_milestone: true
- node_type: test
- status: active
- created_at: 2026-05-27
- updated: 2026-05-27

## Worktrack Intake Review

- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true
- repo_fundamentals: MS7 active; WT-039, WT-045, WT-040, WT-041, WT-042, WT-043 completed; baseline branch `develop`.
- snapshot_freshness: repo baseline `9b4acddfd5d7c1379591b71530796b45cdfd84c4` includes the full admin knowledge import path.
- milestone_purpose_alignment: Final planned MS7 test/review worktrack to prove provider config, knowledge import, private storage, parsing, retrieval, UI, and security constraints hold together.
- historical_conflict_risk: Must not silently accept milestone final completion; final MS7 acceptance remains programmer-only.
- worktrack_adjustment_recommendations: Prefer focused regression tests and a concise validation report over broad feature expansion.
- add_remove_worktrack_recommendations: Add follow-up worktrack only if validation finds a real blocker or missing acceptance surface.

## Baseline

- baseline_branch: develop
- baseline_ref: 9b4acddfd5d7c1379591b71530796b45cdfd84c4
- work_branch: worktrack/wt-20260527-044-kb-import-validation
- worktree_path: .worktrees/wt-20260527-044-kb-import-validation
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: validation + safety review + milestone handback
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

Validate MS7 end-to-end knowledge import and provider configuration behavior, close safety gaps, and produce a milestone acceptance handback for the programmer.

### In Scope

- Regression tests or targeted fixes for admin/non-admin access, upload validation, private storage, parsing, listing/toggling, retrieval citation behavior, and provider secret boundaries.
- Manual/automated validation notes for the admin knowledge UI and AI draft citation path.
- Scope scans for `public/uploads`, `storageKey` exposure, `NEXT_PUBLIC` secrets, pgvector/vector/embedding infrastructure, and unsafe raw provider context.
- Final MS7 validation document summarizing completion signals, evidence, residual risks, and user acceptance boundary.

### Out of Scope

- New product features beyond small validation-driven fixes.
- Semantic/vector retrieval, PostgreSQL/pgvector, PDF/DOCX/OCR, object storage, bulk deletion, or secret manager integration.
- Marking the milestone accepted without programmer decision.

## Acceptance Criteria

1. MS7 acceptance criteria are mapped to verified evidence or explicit residual risk.
2. `npm run lint`, `npm run test`, and `npm run build` pass.
3. Targeted security scans find no new public knowledge upload storage, private storage key exposure, client-side provider secrets, or vector infrastructure.
4. Any validation blocker is fixed in scope or converted into a follow-up worktrack before milestone handback.
5. A concise MS7 final validation report is committed and the milestone is handed back for programmer acceptance.
