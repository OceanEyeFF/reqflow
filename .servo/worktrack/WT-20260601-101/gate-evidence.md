# Gate Evidence: WT-20260601-101

## Metadata

- worktrack_id: WT-20260601-101
- title: 检索覆盖诊断与追问 evidence 结构
- milestone_id: MS-12
- node_type: feature
- evidence_collected_at: 2026-06-01
- branch: worktrack/wt-20260601-101-coverage-diagnostics
- baseline_ref: 9c9fe97

## Implementation Evidence

- verdict: pass
- review_profile: standard
- selected_review_lanes: static-semantic-review, test-review
- changed_files:
  - `src/lib/ai/types.ts`
  - `src/lib/ai/knowledge.ts`
  - `src/lib/ai/draft-service.ts`
  - `src/lib/ai/deepseek-provider.ts`
  - `src/lib/ai/knowledge.test.ts`
  - `src/lib/ai/draft-service.test.ts`
  - `src/lib/ai/deepseek-provider.test.ts`
  - `src/app/api/ai/draft/route.test.ts`
  - `src/app/api/admin/knowledge/search/route.test.ts`
- semantic_review:
  - Added `AiCoverageDiagnostics` as a derived safe evidence object.
  - `toSafeSearchEvidence` now computes matched/missing core terms from lexical must-term evidence, selected KB scope from filters, citation count from bounded citations, vector lane status without raw vector failure evidence, and lexical engine/candidate counters.
  - `generateRequirementDraft` passes only `coverageDiagnostics` to the provider request, not raw `searchEvidence`.
  - Deepseek request payload includes `coverageDiagnostics`, allowing clarify mode to reason about coverage gaps while preserving citation/provider boundaries.
- security_review:
  - Raw vector failure evidence is not included in `AiCoverageDiagnostics`.
  - Tests assert provider request and API/admin search response do not expose `secret`, `apiKey`, storage paths, or raw vector evidence.
  - No provider secret, raw API key, disabled knowledge content, or unauthorized knowledge-base content is introduced.
- architecture_review:
  - No Prisma schema, migration, UI grouping, question schema, BM25 runtime, or embedding sidecar default changes.
  - The change stays inside the existing AI knowledge adapter/provider contract seam.
- residual_risks:
  - UI grouping of coverage gaps remains out of scope for WT-105.
  - Business interrogation prompt/schema semantics remain out of scope for WT-103/WT-104.

## Validation Evidence

- verdict: pass_with_environmental_build_blocker
- focused_tests:
  - command: `E:\repos\personal\reqflow\node_modules\.bin\vitest.cmd run src/lib/ai/knowledge.test.ts src/lib/ai/draft-service.test.ts src/lib/ai/deepseek-provider.test.ts src/app/api/ai/draft/route.test.ts src/app/api/admin/knowledge/search/route.test.ts`
  - result: pass, 5 files / 36 tests
- lint:
  - command: `npm run lint`
  - result: pass, ESLint 0 warnings
- full_tests:
  - command: `npm run test`
  - result: pass, 32 files / 251 tests
  - environment_note: worktree required an ignored local `node_modules` junction to the main checkout dependency install because test helpers invoke `node_modules/prisma/build/index.js` by relative path.
- diff_check:
  - command: `git diff --check`
  - result: pass
- build:
  - command: `npm run build`
  - result: blocked by external Google Fonts fetch, not by TypeScript or local code diagnostics
  - error_summary: Next.js `next/font` failed to fetch `Geist` and `Geist Mono` from `https://fonts.googleapis.com/...`
  - repeat_result: same external fetch failure on retry

## Policy Evidence

- verdict: pass_with_recorded_build_blocker
- worktree_discipline: code changes were made in `.worktrees/wt-20260601-101-coverage-diagnostics`, not in the main checkout.
- scope_boundary: no UI grouping, schema migration, BM25 runtime claim, or embedding sidecar default enablement.
- nextjs_docs: read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` before touching route-adjacent tests and API behavior.
- ignored_local_artifacts:
  - `node_modules` junction is ignored by `.gitignore` and not part of the change.
  - `.next` output is ignored by `.gitignore` and not part of the change.
- line_endings: Git reports CRLF normalization warnings for touched files; `git diff --check` passed.

## Gate Verdict

- implementation_gate: pass
- validation_gate: pass_with_environmental_build_blocker
- policy_gate: pass_with_recorded_build_blocker
- overall_verdict: pass_with_blocked_build_recheck
- confidence: medium-high
- confidence_reason: Focused and full tests plus lint and diff check pass; production build could not complete because of repeat external font fetch failure unrelated to this diff.
- allowed_next_routes:
  - Close after commit, with build blocker recorded as environmental validation residual.
  - Re-run `npm run build` when Google Fonts access is available.
- residual_risks:
  - Build gate is not green in this worktree because external font fetch failed twice.
  - Final closeout should not claim build pass.
