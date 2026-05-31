# Worktrack Contract: WT-20260529-082

## Metadata

- worktrack_id: WT-20260529-082
- title: 中文检索评测语料、Evaluation Harness 与质量 Gate
- milestone_id: MS-9
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-31
- updated: 2026-05-31

## Worktrack Intake Review

- repo_fundamentals: active milestone `MS-9`; WT-078 defined evaluation requirements, WT-080 migrated Prisma to PostgreSQL, and WT-081 proved pgvector plus native FTS fallback readiness.
- snapshot_freshness: `develop` baseline is `a4c1c816d238ef3e1c63ab3682eb656b09f06d47`, with MS-9 progress at 4/5.
- milestone_purpose_alignment: directly supports MS-9 completion signal 6 and acceptance criterion 8 by making Chinese retrieval evaluation cases and gate metrics explicit before MS-10 implementation.
- historical_conflict_risk: medium; current retrieval is lightweight substring scoring, so this worktrack must define future quality gates without pretending hybrid retrieval already exists.
- worktrack_adjustment_recommendations: create static evaluation cases, schema validation, threshold checks, documentation, and future result contract. Do not implement lexical/vector/fusion retrieval.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Baseline

- baseline_branch: develop
- baseline_ref: a4c1c816d238ef3e1c63ab3682eb656b09f06d47
- work_branch: worktrack/wt-20260529-082-chinese-retrieval-quality-gate
- worktree_path: .worktrees/wt-20260529-082-chinese-retrieval-quality-gate

## Scope

### Goal

Establish a fixed Chinese retrieval evaluation corpus and executable schema/quality gate contract for later hybrid retrieval implementation.

### In Scope

- Versioned evaluation case JSON.
- Gate script that validates case shape, IDs, thresholds, must terms, forbidden sources, and citation traceability expectations.
- Result contract for future retrieval runs.
- Documentation of recall/noise/citation gates and anti-cheat boundaries.
- CI wiring for the evaluation corpus gate.
- WT-082 control artifacts and gate evidence.

### Out of Scope

- Implementing lexical, vector, or fusion retrieval.
- Adding SearchIndexProfile, embedding provider, or search index tables.
- Calling AI providers.
- Measuring real recall against a not-yet-built hybrid retriever.
- Changing existing runtime retrieval behavior.

## Typed Execution Policy

- baseline_form: commit-on-test-branch
- merge_required: yes
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover
- runtime_dispatch_mode: auto

## Acceptance Criteria

- Evaluation cases include `query`, `expectedSourceIds`, `expectedSnippetIds`, `mustContainTerms`, `forbiddenSourceIds`, `minRecallAt5`, `maxNoiseAt5`, and `citationTraceability`.
- Cases cover lexical fallback, vector/filter recall, forbidden source exclusion, selected knowledge-base scope, and citation traceability.
- Gate script fails closed on malformed cases or invalid thresholds.
- Documentation explains how future MS-10 retrieval result JSON must be evaluated.
- No hybrid retrieval runtime implementation is introduced.

## Verification Requirements

- `node --check scripts/retrieval-evaluation-gate.mjs`
- `npm run retrieval:evaluate`
- `git diff --check`
- `npm run lint`
- `npm run test`
- `npm run build`
- Review changed files for retrieval/runtime scope non-change.

## Rollback Conditions

- Evaluation cases are too vague to detect forbidden source or citation failures.
- Gate script accepts missing metrics or out-of-range thresholds.
- Worktrack changes runtime retrieval behavior.
