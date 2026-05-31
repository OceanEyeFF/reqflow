# Gate Evidence: WT-20260529-088

## Metadata

- worktrack_id: WT-20260529-088
- title: Hybrid Retrieval evaluation harness 与回归测试
- milestone_id: MS-10
- branch: worktrack/wt-20260529-088-hybrid-retrieval-regression
- status: gate-passed

## Implementation Evidence

- `scripts/retrieval-evaluation-gate.mjs` now validates MS-10 hybrid/context result evidence in addition to the existing corpus-only contract.
- Result evidence must include allowed `retrievalMode`, `debugEvidence.filterReasons`, `rawScoreAddition: false`, 1-5 fused hits with RRF contribution fields, vector lane status/reason, and context window cap membership.
- The canonical result file must include all four declared retrieval modes: `lexical-only`, `vector-only`, `hybrid-fusion`, and `context-window`.
- Fused hit evidence and context window membership must align with every returned top-5 snippet; context chars must be non-negative and within `maxContextChars`.
- Canonical vector-lane failure evidence covers both embedding provider failure and `dimensions-mismatch`.
- Tag-driven checks require semantic/fusion cases to show ready vector lane evidence, filter-related cases to show explicit filter reasons, and context-builder cases to use `context-window` mode.
- Added `docs/retrieval-evaluation-ms10-results.json` as the canonical MS-10 regression result fixture covering the five existing Chinese evaluation cases.
- Updated `docs/retrieval-evaluation-harness.md` to document the hybrid/context evidence shape and fixture path.

## Validation Evidence

- `npm run retrieval:evaluate` passed: corpus gate validated 5 cases.
- `node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json docs/retrieval-evaluation-ms10-results.json` passed: result gate validated 5 results.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run postgres:readiness` passed: Prisma schema valid, 9 migrations found, database schema up to date.
- `npm run lint` passed.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev npm run test` passed: 30 files / 234 tests.
- `npm run build` passed. Known worktree multi-lockfile warning observed; no build failure.
- `git diff --check` passed.

## Policy Review

- Scope stayed inside the WT-088 test/docs/control-plane contract.
- No production retrieval behavior, provider billing path, external reranker, AI draft integration, cloud deployment, or system configuration changed.
- Sidecar CodeReview found four evidence gaps: missing `vector-only` coverage, debug evidence not aligned to returned snippets, negative `contextChars` accepted, and missing provider failure coverage. All four were fixed and revalidated locally.

## Gate Surfaces

- implementation-gate: pass.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
