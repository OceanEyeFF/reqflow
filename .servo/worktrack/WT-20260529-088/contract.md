# Worktrack Contract: WT-20260529-088

## Metadata

- worktrack_id: WT-20260529-088
- title: Hybrid Retrieval evaluation harness 与回归测试
- milestone_id: MS-10
- derived_from_milestone: true
- node_type: test
- status: initialized
- priority: 6
- branch: worktrack/wt-20260529-088-hybrid-retrieval-regression
- baseline_branch: develop
- baseline_ref: b3a23b655e0cb5d39812c672885de59c6202c5c4
- created_at: 2026-05-31
- created_by: harness-kernel

## Worktrack Intake Review

- repo_fundamentals: MS-10 is active at 5/6 completed; schema, lexical, vector, fusion, and context builder lanes are implemented.
- snapshot_freshness: `.servo/repo/snapshot-status.md` records WT-20260529-088 as active_or_next_worktrack after WT-087 closeout.
- milestone_purpose_alignment: WT-088 supplies the final regression gate for MS-10 hybrid retrieval behavior.
- historical_conflict_risk: Medium; evaluation must validate evidence shape without overfitting to implementation internals or accepting self-reported metrics.
- worktrack_adjustment_recommendations: Extend existing retrieval evaluation gate/result fixture and run full local validation. Do not implement AI draft integration.
- add_remove_worktrack_recommendations: none.
- intake_review_verdict: ready_for_worktrack_init
- ready_for_worktrack_init: true

## Scope

### In Scope

- Extend retrieval evaluation gate to validate hybrid/context evidence fields.
- Add a canonical MS-10 regression result fixture.
- Cover lexical-only, vector-only, fusion, forbidden source, filter reasons, context caps, citation traceability, embedding provider failure, and profile status/dimension mismatch.
- Update docs and gate evidence.
- Run full validation.

### Out of Scope

- New retrieval production behavior.
- AI draft integration.
- Admin UI/debug display.
- Remote CI push or cloud deployment.

## Affected Modules

- `scripts/retrieval-evaluation-gate.mjs`
- `docs/retrieval-evaluation-*.json`
- `docs/retrieval-evaluation-harness.md`
- `.servo/worktrack/WT-20260529-088/`

## Acceptance Criteria

1. Evaluation gate validates hybrid/context evidence, not just top-level source/snippet ids.
2. Regression fixture covers lexical-only, vector-only, fusion, filters, context caps, citation traceability, provider failure, and profile mismatch.
3. Existing corpus gate remains compatible.
4. `npm run retrieval:evaluate`, focused gate result validation, lint, full tests, build, and PostgreSQL readiness pass.
