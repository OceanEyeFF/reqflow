# Worktrack Contract: WT-20260601-127

## Metadata

- worktrack_id: WT-20260601-127
- title: Rollback, operator runbook, and default-runtime switch decision report
- milestone_id: MS-15
- derived_from_milestone: true
- node_type: review
- status: active
- created: 2026-06-01
- owner: codex

## Baseline

- baseline_branch: develop
- baseline_ref: 9a3bd2d
- branch: worktrack/wt-20260601-127-paradedb-runtime-decision
- worktree: .worktrees/wt-20260601-127-paradedb-runtime-decision
- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: final-report + rollback-doc + full-validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Goal

Close MS-15 with a rollback/operator runbook and final decision report that
summarizes evidence, recommends enable/defer/reject, and preserves fdch0's
approval boundary for milestone acceptance and any default runtime switch.

## In Scope

- Document ParadeDB candidate start/smoke/benchmark/stop commands.
- Document rollback to the accepted MS-13 default runtime.
- Summarize WT-123 through WT-126 evidence.
- Recommend whether to enable, defer, or reject the default runtime switch.
- Run final validation commands and policy scans.

## Out Of Scope

- Switching `docker-compose.runtime.yml` to ParadeDB.
- Migrating existing local/production volumes.
- Deleting volumes, uploads, model cache, or DB state.
- Implementing ParadeDB in application retrieval code.
- Importing large local zip corpora.
- Final milestone acceptance.

## Acceptance Criteria

- Final report explicitly states the decision recommendation and fdch0 approval boundary.
- Rollback runbook gives non-destructive stop/start paths for both candidate and MS-13 default runtime.
- Final validation includes lint/test/build, compose config, BM25 gates, retrieval gate, strict `pg_search` readiness or explicit evidence reference, and policy scan.
- No final doc claims BM25 is active in the default runtime.
- MS-15 remains awaiting fdch0 final acceptance after WT-127.

## Runtime Dispatch

- runtime_dispatch_mode: auto
- carrier_decision: current-carrier
- decision_inputs: final reporting is a tightly scoped evidence synthesis and validation task.
- fallback_reason: no separate implementation slice needed.
