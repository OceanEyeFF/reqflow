# Gate Evidence: WT-20260601-129

## Metadata

- worktrack_id: WT-20260601-129
- milestone_id: MS-16
- status: pass
- updated: 2026-06-02

## Implementation Evidence

- Added `docs/ms16-paradedb-default-migration-rollback-cost.md`.
- Added WT-129 control artifacts:
  - `.servo/worktrack/WT-20260601-129/contract.md`;
  - `.servo/worktrack/WT-20260601-129/plan-task-queue.md`;
  - `.servo/worktrack/WT-20260601-129/gate-evidence.md`.
- Did not modify `docker-compose.runtime.yml`.
- Did not modify `docker-compose.paradedb.yml`.
- Did not migrate, delete, prune, or convert volumes, uploads, model cache, or database state.
- Did not implement app retrieval changes.

## Evidence Traceability

- Current default compose evidence: `docker-compose.runtime.yml`.
- ParadeDB candidate compose evidence: `docker-compose.paradedb.yml`.
- MS-13 operator and rollback baseline: `docs/ms13-runtime-operator-runbook.md`.
- MS-15 runtime candidate design: `docs/ms15-paradedb-runtime-design.md`.
- MS-15 candidate rollback/runbook: `docs/ms15-paradedb-operator-runbook.md`.
- MS-15 final decision boundary: `docs/ms15-final-decision-report.md`.
- Search extension readiness boundary: `docs/search-extension-readiness.md`.

## Decision Evidence

- Recommended pre-production migration shape: fresh ParadeDB/PostgreSQL 18 default data volume, with MS-13 volume kept untouched until gates pass.
- Logical dump/restore is a separate higher-cost option when data preservation matters.
- Direct volume reuse is rejected for the MS-16 recommendation path.
- Rollback remains stop ParadeDB runtime, start MS-13 default runtime, and rerun runtime smoke/search readiness.

## Policy Evidence

- Pre-production status is treated as a risk modifier, not permission to skip rollback.
- No report language claims BM25 is active in the default runtime.
- Runtime switch, production migration, and app retrieval implementation remain later approval boundaries.
- No destructive cleanup command is introduced as an instruction.

## Validation Evidence

- `git diff --check`: pass.
- Targeted policy scan: pass.
- `npm run lint`: not applicable; documentation/control-plane research only.
- `npm run test`: not applicable; no application behavior changed.
- `npm run build`: not applicable; no application behavior changed.

## Gate Verdict

- migration-impact-gate: pass
- rollback-cost-gate: pass
- evidence-traceability-gate: pass
- policy-gate: pass
- validation-gate: pass with documented not-applicable reasons for app commands
- final: pass
