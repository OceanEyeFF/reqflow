# Gate Evidence: WT-20260601-130

## Metadata

- worktrack_id: WT-20260601-130
- milestone_id: MS-16
- status: pass
- updated: 2026-06-02

## Implementation Evidence

- Added `docs/ms16-app-retrieval-integration-impact.md`.
- Added WT-130 control artifacts:
  - `.servo/worktrack/WT-20260601-130/contract.md`;
  - `.servo/worktrack/WT-20260601-130/plan-task-queue.md`;
  - `.servo/worktrack/WT-20260601-130/gate-evidence.md`.
- Did not modify application retrieval code.
- Did not modify Prisma schema or migrations.
- Did not modify `docker-compose.runtime.yml` or `docker-compose.paradedb.yml`.
- Did not migrate, delete, prune, or convert volumes, uploads, model cache, or database state.

## Evidence Traceability

- Current lexical/native FTS path: `src/lib/knowledge/retrieval.ts`.
- Active lexical engine metadata: `src/lib/knowledge/lexical-engines.ts`.
- RRF/no raw score addition tests: `src/lib/knowledge/retrieval.test.ts`.
- Schema/profile context: `prisma/schema.prisma`.
- Existing same-corpus ParadeDB lexical and hybrid invariant evidence: `docs/ms15-paradedb-hybrid-comparison.md`.
- Sidecar Explorer output: app retrieval code inspection completed read-only on 2026-06-02.

## Decision Evidence

- Future implementation likely touches retrieval adapter, lexical engine readiness, Prisma migration/raw SQL index DDL, retrieval tests, lexical engine tests, and AI/admin evidence consumers.
- Runtime availability alone does not deliver app-level BM25 behavior.
- Product value is highest when ParadeDB ranked lexical IDs are wired into existing RRF-style fusion while preserving filters and citations.
- Future implementation must rerun retrieval gates with ParadeDB as the actual app lexical lane.

## Policy Evidence

- Raw BM25 scores and vector scores must remain separate and are not additive.
- Native FTS fallback remains distinct from BM25.
- No report language claims BM25 is currently active in the app.
- Default runtime switch and app retrieval implementation remain later approval/implementation boundaries.

## Validation Evidence

- `git diff --check`: pass.
- Targeted policy scan: pass.
- `npm run lint`: not applicable; documentation/control-plane research only.
- `npm run test`: not applicable; no application behavior changed.
- `npm run build`: not applicable; no application behavior changed.

## Gate Verdict

- integration-impact-gate: pass
- product-benefit-gate: pass
- evidence-traceability-gate: pass
- policy-gate: pass
- validation-gate: pass with documented not-applicable reasons for app commands
- final: pass
