# Gate Evidence: WT-20260531-100

## Metadata

- worktrack_id: WT-20260531-100
- milestone_id: MS-11
- title: 本地 CPU Embedding sidecar PoC
- status: pass
- updated: 2026-05-31

## Implementation Evidence

- Added `src/lib/knowledge/embedding-http-provider.ts`.
  - Supports OpenAI-compatible `/v1/embeddings` request/response shape.
  - Supports TEI-style `/embed` request/response shape.
  - Preserves provider/model/dimensions identity for existing `EmbeddingProvider` invariants.
  - Fails closed for missing base URL, non-2xx response, malformed vector, non-finite vector, and dimension mismatch.
- Updated `src/lib/knowledge/embeddings.ts`.
  - Provider exceptions during generation or vector retrieval now return structured `provider-unavailable` evidence instead of escaping.
  - Existing deterministic test provider remains the default.
- Added `docker-compose.embedding.yml`.
  - Optional Hugging Face TEI CPU sidecar service.
  - Uses a named model cache volume.
  - Does not modify the main app image.
- Added `scripts/local-embedding-sidecar-probe.mjs` and `npm run embedding:probe`.
  - Manual-only probe for endpoint, dimensions, iterations, and latency summary.
  - Not required in CI/default validation.
- Added `docs/local-embedding-sidecar-poc.md` and updated README/operator/feasibility docs.

## Validation Evidence

- Local Next docs read:
  - `node_modules/next/dist/docs/index.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npx vitest run src/lib/knowledge/embedding-http-provider.test.ts src/lib/knowledge/embeddings.test.ts`
  - Result: pass; 2 files / 22 tests.
- `node --check scripts/local-embedding-sidecar-probe.mjs`
  - Result: pass.
- `git diff --check`
  - Result: pass. Git reported LF-to-CRLF working-copy warnings only.
- `npm run lint`
  - Result: pass.
- `npm run retrieval:evaluate`
  - Result: pass; 5 corpus cases validated.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run postgres:readiness`
  - Result: pass; Prisma schema valid, 9 migrations found, database schema up to date.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run search:extensions`
  - Result: pass; PostgreSQL 16.14, pgvector 0.8.2, native PostgreSQL FTS readiness pass, pg_search unavailable with native fallback required.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npx vitest run src/lib/knowledge/embedding-http-provider.test.ts src/lib/knowledge/embeddings.test.ts src/lib/knowledge/retrieval.test.ts`
  - Result: pass; 3 files / 48 tests.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run test`
  - Result: pass; 32 files / 250 tests.
- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npm run build`
  - Result: pass. Known worktree multi-lockfile root inference warning observed; no build failure.

## Scope Review

- No schema or migration change.
- No default provider change.
- No model weights downloaded or committed.
- No real sidecar container was required for automated validation.
- Production enablement remains out of scope pending image digest/model revision/license/hardware/queue/reindex decisions.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- overall: pass
