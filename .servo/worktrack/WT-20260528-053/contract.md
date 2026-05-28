# Worktrack Contract: WT-20260528-053

## Metadata

- worktrack_id: WT-20260528-053
- title: 知识内容多选/全选/反选删除
- milestone_id: MS-20260528-001
- derived_from_milestone: true
- node_type: feature
- status: active
- created: 2026-05-28
- updated: 2026-05-28

## Branch And Baseline

- branch: worktrack/wt-20260528-053-bulk-delete-cleanup
- baseline_branch: develop
- baseline_commit: ef93eae0c6a14c6aa332ed943d4b3e11f04fb11f
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: WT-052/WT-051 established knowledge bases and multi-file upload to selected bases.
- snapshot_freshness: current baseline is develop `ef93eae`; previous MS8 worktracks are merged and closed.
- milestone_purpose_alignment: this worktrack replaces broad all-clear deletion with explicit selected source deletion controls.
- historical_conflict_risk: medium; current route still supports full clear and UI exposes a global full-clear button.
- worktrack_adjustment_recommendations: implement source-level selection deletion, keep single-source deletion route compatible, and remove UI full-clear affordance from the normal management path.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Task Goal

Allow admins to select knowledge sources and delete only those selected sources using select all / invert controls and explicit confirmation.

## In Scope

- Backend selected-source delete helper and `DELETE /api/admin/knowledge/sources` selected mode.
- UI source selection state, select all, invert selection, and delete selected action.
- Preserve storage cleanup behavior for deleted sources.
- Preserve single source delete API and route tests.

## Out Of Scope

- Snippet-level destructive deletion.
- Knowledge base deletion.
- Recycle bin, archive, undo, old-version auto cleanup, or irreversible broad physical deletion beyond selected sources.
- AI retrieval changes.

## Acceptance Criteria

1. Admin can select multiple sources and delete only selected sources.
2. Select all and invert selection operate on currently loaded sources.
3. Delete selected requires explicit confirmation and does not delete unselected sources.
4. Non-admins cannot bulk delete.
5. Private storage cleanup is attempted for deleted sources and errors are reported.
6. `npm run lint`, `npm run test`, and `npm run build` pass, or Gate records a precise equivalent blocker.
