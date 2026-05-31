# Gate Evidence: WT-20260529-082

## Metadata

- worktrack_id: WT-20260529-082
- title: 中文检索评测语料、Evaluation Harness 与质量 Gate
- milestone_id: MS-9
- node_type: test
- status: pass
- created_at: 2026-05-31
- carrier_decision: current-carrier

## Implementation Evidence

- Added `docs/retrieval-evaluation-cases.json` with 5 fixed Chinese retrieval evaluation cases.
- Added `scripts/retrieval-evaluation-gate.mjs`.
- Added `npm run retrieval:evaluate`.
- Added GitHub Actions `retrieval-evaluation-corpus` job.
- Added `docs/retrieval-evaluation-harness.md`.
- Added WT-082 contract and plan queue artifacts.

## Corpus Evidence

- Cases include `query`, `selectedKnowledgeBaseIds`, `expectedSourceIds`, `expectedSnippetIds`, `mustContainTerms`, `forbiddenSourceIds`, `minRecallAt5`, `maxNoiseAt5`, `citationTraceability`, and `tags`.
- Coverage tags include lexical fallback, selected scope, semantic/fusion, forbidden source/lifecycle filter, and citation traceability.
- Future result contract validates `recallAt5`, `noiseAt5`, returned source/snippet IDs, forbidden source exclusion, and citation traceability.

## Boundary Evidence

- No lexical/vector/fusion retrieval implementation was added.
- No SearchIndexProfile, embedding provider, vector index table, or retrieval runtime schema was added.
- No AI provider call path changed.
- Existing AI draft and knowledge retrieval runtime behavior was not changed.

## Validation Evidence

- `node --check scripts/retrieval-evaluation-gate.mjs`: pass.
- `npm run retrieval:evaluate`: pass, 5 cases validated.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx prisma generate`: pass.
- `npm run test` with PostgreSQL `DATABASE_URL` and `TEST_DATABASE_URL`: pass, 28 files / 201 tests.
- `npm run build` with PostgreSQL `DATABASE_URL`: pass with existing Next.js multi-lockfile worktree warning only.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass

## Residual Risks

- The harness validates fixed cases and future result shape; it does not measure real hybrid retrieval quality until MS-10 produces retrieval outputs.
- Actual recall/noise thresholds may need calibration after MS-10 implementation generates first real result files.
- Milestone final acceptance remains fdch0's decision.
