# Gate Evidence: WT-20260601-128

## Metadata

- worktrack_id: WT-20260601-128
- milestone_id: MS-16
- status: pass
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms16-runtime-path-cost-benefit-model.md`.
- Added WT-128 control artifacts:
  - `.servo/worktrack/WT-20260601-128/contract.md`;
  - `.servo/worktrack/WT-20260601-128/plan-task-queue.md`;
  - `.servo/worktrack/WT-20260601-128/gate-evidence.md`.
- Did not modify `docker-compose.runtime.yml`.
- Did not modify `docker-compose.paradedb.yml`.
- Did not migrate, delete, prune, or convert volumes, uploads, model cache, or database state.
- Did not implement app retrieval changes.

## Evidence Traceability

- Current default runtime evidence: `docs/ms13-final-validation.md`.
- BM25 candidate selection evidence: `docs/ms14-final-decision-report.md`.
- ParadeDB candidate validation evidence: `docs/ms15-final-decision-report.md`.
- Candidate operator and rollback evidence: `docs/ms15-paradedb-operator-runbook.md`.
- Same-corpus lexical and hybrid invariant boundary: `docs/ms15-paradedb-hybrid-comparison.md`.
- Machine-readable ParadeDB benchmark evidence: `docs/ms15-paradedb-candidate-benchmark-results.json`.
- Machine-readable lexical comparison evidence: `docs/ms15-paradedb-hybrid-comparison-results.json`.

## Decision Model Evidence

- Compared all three MS-16 runtime paths:
  - keep current default runtime;
  - keep ParadeDB optional/candidate;
  - move toward ParadeDB as default runtime.
- Cost dimensions include engineering, validation, migration/rollback, operations, and developer experience.
- Benefit dimensions include search quality, product capability, and strategic timing.
- The model treats pre-production status as a strategic timing modifier, not as permission to skip migration or rollback analysis.
- The model preserves fdch0 as final runtime decision owner.

## Policy Evidence

- Raw BM25 scores and vector scores are not compared or added.
- Native FTS fallback is not labeled BM25.
- Optional ParadeDB and default ParadeDB are kept as separate paths.
- ParadeDB default is described as a future selection/implementation path, not current active behavior.
- No runtime default switch is made by WT-128.

## Validation Evidence

- `git diff --check`: pass.
- Targeted policy scan: pass.
- `npm run lint`: not applicable; documentation/control-plane research only.
- `npm run test`: not applicable; no application behavior changed.
- `npm run build`: not applicable; no application behavior changed.

## Gate Verdict

- decision-model-gate: pass
- evidence-traceability-gate: pass
- policy-gate: pass
- validation-gate: pass with documented not-applicable reasons for app commands
- final: pass
