# WT-20260601-107 Plan / Task Queue

| # | task | status | evidence |
|---|------|--------|----------|
| T1 | Inspect existing embedding provider seam, pgvector generation, hybrid retrieval, and WT-100 sidecar PoC evidence | done | Existing `embeddings.ts`, `retrieval.ts`, tests, probe script, and WT-100 evidence reviewed |
| T2 | Add focused sidecar-shaped indexing to hybrid retrieval regression | done | `src/lib/knowledge/retrieval.test.ts` adds explicit local sidecar provider config -> embedding upsert -> hybrid vector lane evidence |
| T3 | Add explicit real HTTP sidecar indexing trial gate | done | `scripts/local-embedding-indexing-trial.ts`; `npm run embedding:indexing-trial` |
| T4 | Document MS-12 local embedding indexing trial and deferred production boundary | done | `docs/ms12-local-embedding-indexing-trial.md` |
| T5 | Run focused, full, and milestone validation gates | pending | To be recorded in `gate-evidence.md` |
| T6 | Merge back to develop and refresh MS-12 state | pending | To be completed after gate pass |
