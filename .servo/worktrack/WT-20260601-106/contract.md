# Worktrack Contract: WT-20260601-106

## Metadata

- worktrack_id: WT-20260601-106
- title: 耗材标准检验出库 golden case 验收
- milestone_id: MS-12
- node_type: test
- status: active
- branch: worktrack/wt-20260601-106-consumables-golden-case
- baseline_branch: develop
- baseline_ref: eba149e
- created_by: harness-kernel
- created_at: 2026-06-01

## Task Goal

Add a deterministic golden-case gate for "一般耗材标准检验出库" so MS-12 can fail if clarify output contains only generic questions and misses expected business interrogation topics.

## Scope

### In Scope

- Add a golden case fixture and validation script.
- Require questions for coverage gaps, exception rules/direct outbound boundary, QC sampling quantity, QC 抽样 vs QC 取样, failure path, and inner/outer warehouse responsibility.
- Validate category, priority, `blocksDraft`, basis, expected answer format, and related text.
- Add an npm script for local and milestone-gate use.

### Out of Scope

- Calling real LLM providers.
- Seeding real knowledge bases.
- UI changes or provider prompt changes.

## Acceptance Criteria

1. Golden case gate passes for the checked-in fixture.
2. Gate fails if required high-value topics are missing or if all questions are generic.
3. Focused tests/script, lint, full test, build, and diff check pass.

