# Worktrack Contract: WT-20260531-100

## Metadata

- worktrack_id: WT-20260531-100
- title: 本地 CPU Embedding sidecar PoC
- milestone_id: MS-11
- node_type: feature
- status: active
- branch: worktrack/wt-20260531-100-local-embedding-sidecar-poc
- baseline_branch: develop
- baseline_ref: 5d56565
- created_by: harness-kernel
- created_at: 2026-05-31

## Task Goal

基于 `docs/local-embedding-docker-feasibility.md` 实现一个低风险、可选的本地 CPU embedding HTTP sidecar PoC，使现有 `EmbeddingProvider` seam 可以接入 TEI/OpenAI-compatible 风格的 HTTP embedding 服务，并提供本地 compose、探测/benchmark 与验收文档。

## Scope

### In Scope

- Add an optional HTTP embedding sidecar provider adapter.
- Keep provider identity, model, dimensions, and semantic space locked by existing `EmbeddingProviderConfig` and `SearchIndexProfile` rules.
- Add unit tests for request shape, output parsing, timeout/error behavior, and dimensions fail-closed behavior.
- Add optional Docker Compose sidecar configuration with pinned image/model revision placeholders.
- Add a local probe/benchmark script that can be run when the sidecar is available, without requiring it in normal test/build.
- Update operator docs with setup, validation, benchmark, and rollback boundaries.

### Out of Scope

- Bundling model weights into the main Next.js image.
- Making local sidecar the default provider.
- Downloading model weights during CI.
- Background embedding queues or production reindex workflow.
- Production deployment decision.
- Schema/migration changes.

## Carrier Decision

- carrier_decision: current-carrier
- decision_inputs: small cross-cutting library/docs/script change; tight coupling to current repo state; low parallel dispatch value.
- fallback_reason: SubAgent dispatch is approved but not necessary for this contained PoC.

## Acceptance Criteria

1. Normal app/test/build behavior remains unchanged unless a caller explicitly selects the HTTP sidecar provider.
2. HTTP provider returns a valid `EmbeddingProviderResult` only when provider/model/dimensions match the request/profile.
3. Sidecar timeout, non-2xx response, malformed response, missing vector, and dimension mismatch fail closed.
4. Optional compose/probe docs do not claim production readiness or require model downloads during CI.
5. `npm run lint`, focused tests, full tests, build, retrieval evaluation, PostgreSQL readiness, search extension readiness, and diff check pass.
