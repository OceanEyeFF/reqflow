# Gate Evidence: WT-20260601-127

## Metadata

- worktrack_id: WT-20260601-127
- milestone_id: MS-15
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Added `docs/ms15-paradedb-operator-runbook.md`.
- Added `docs/ms15-final-decision-report.md`.
- Added WT-127 control artifacts.
- Regenerated `docs/ms15-paradedb-hybrid-comparison-results.json` during final validation.
- Did not modify `docker-compose.runtime.yml`.
- Did not switch the default runtime.
- Did not migrate or delete Docker volumes, uploads, model cache, or database state.

## Decision Evidence

- Final recommendation: defer default runtime switch; approve ParadeDB as the next implementation candidate.
- Reason: candidate runtime passed image/runtime, Prisma/app smoke, strict extension readiness, Chinese BM25 benchmark, tokenizer evidence, and hybrid invariant comparison, but application retrieval has not yet been wired to ParadeDB `pg_search`.
- Remaining blockers before default enablement:
  - feature-flagged app lexical adapter is not implemented;
  - same-corpus ParadeDB hybrid app performance is not measured;
  - `pdb.unicode default` is ranking-compatible but not final word-level Chinese segmentation proof;
  - no existing local/production data migration is approved;
  - compact benchmark corpus is not production capacity evidence.

## Rollback Evidence

- Operator runbook documents candidate start/smoke/benchmark/stop commands.
- Rollback path is non-destructive:
  - stop candidate with `docker compose -f docker-compose.paradedb.yml stop web postgres`;
  - start MS-13 default with `docker compose -f docker-compose.runtime.yml up -d --build postgres web`;
  - run `npm run runtime:smoke` against default ports or documented alternate ports.
- Runbook explicitly forbids `down -v`, `volume rm`, `system prune`, manual cache deletion, and mounting MS-13 default volumes into ParadeDB without approval.

## Validation Evidence

- `npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json`: pass.
- `npm run retrieval:evaluate -- docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json`: pass.
- `npm run paradedb:hybrid-comparison`: pass.
  - ParadeDB avg Recall@5: `1.0000`.
  - ParadeDB avg p50: `279.831ms`.
  - Hybrid RRF invariant: pass.
- `docker compose -f docker-compose.paradedb.yml config`: pass.
  - resolved image: `paradedb/paradedb@sha256:c3efc689b6ebd2fb396d7f50d68735b2dcff3e03f3bf51a926258d942201da2d`;
  - resolved platform: `linux/amd64`;
  - resolved database volume target: `/var/lib/postgresql`;
  - resolved ports: PostgreSQL `55437`, web `3307`.
- `npm ci`: pass; Windows cleanup warning did not block install.
- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass.
- `git diff --check`: pass.
- Targeted policy scan: pass; no false active-BM25/default-runtime-switch/destructive-command claims found in WT-127 docs/artifacts.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-127-paradedb-runtime-decision`.
- Final report preserves fdch0-only milestone acceptance.
- Final report preserves separate approval for any default runtime switch.
- BM25 remains candidate runtime evidence only.

## Gate Verdict

- final-report-gate: pass
- rollback-runbook-gate: pass
- validation-gate: pass
- regression-gate: pass
- policy-gate: pass
- final: pass
