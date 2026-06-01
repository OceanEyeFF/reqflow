# Worktrack Contract: WT-20260601-120

## Metadata

- worktrack_id: WT-20260601-120
- title: 中文分词/tokenization 兼容性评估
- milestone_id: MS-14
- derived_from_milestone: true
- node_type: test
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: d7b4ceebd8d54720246c74f49658e4ef9758b79d
- branch: worktrack/wt-20260601-120-chinese-tokenization-eval
- worktree: .worktrees/wt-20260601-120-chinese-tokenization-eval
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: test + documentation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Worktrack Intake Review

- repo_fundamentals: MS-14 has candidate matrix, benchmark harness, and three runtime candidate PoCs completed.
- snapshot_freshness: develop baseline is `d7b4cee`, after WT-119 closeout and checkpoint refresh.
- milestone_purpose_alignment: WT-120 synthesizes Chinese tokenizer behavior across measured candidate results before accuracy/performance comparison.
- historical_conflict_risk: do not run new candidate containers or change thresholds; consume existing evidence only.
- worktrack_adjustment_recommendations: focus on tokenization behavior, ranking symptoms, Chinese term preservation, and remaining tokenizer risks.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Goal

Produce the MS-14 Chinese tokenization compatibility report by comparing
ParadeDB `pg_search`, VectorChord-BM25 / `pg_tokenizer`, `pg_textsearch`
availability evidence, and the native FTS baseline fixture against the WT-116
Chinese corpus.

## In Scope

- Summarize tokenizer evidence from candidate result JSON files.
- Compare behavior for pure Chinese, mixed Chinese-English, source paths,
  synonyms/near synonyms, and disabled-source traps.
- Identify candidate-specific tokenization/ranking risks.
- Recommend what WT-121 should treat as tokenizer caveats.

## Out Of Scope

- Starting new candidate containers.
- Changing benchmark corpus thresholds.
- Adding new retrieval implementation.
- Modifying default runtime or compose files.

## Acceptance Criteria

- Report covers ParadeDB, VectorChord-BM25 / `pg_tokenizer`, `pg_textsearch`, and native FTS baseline fixture.
- Report identifies at least one concrete tokenizer/ranking caveat per runnable candidate.
- Report clearly separates tokenizer evidence from final accuracy/performance decision.
- Validation includes JSON parse/result sanity checks, `git diff --check`, and policy scan.

## Runtime Dispatch

- runtime_dispatch_mode: current-carrier
- fallback_reason: evidence synthesis over existing artifacts; no runtime execution required.
