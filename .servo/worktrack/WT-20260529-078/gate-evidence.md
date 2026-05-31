# Gate Evidence: WT-20260529-078

## Metadata

- worktrack_id: WT-20260529-078
- title: Hybrid Search 架构决策与风险边界
- milestone_id: MS-9
- node_type: architecture
- status: pass
- created_at: 2026-05-31
- carrier_decision: current-carrier with SubAgent explorer sidecar

## Implementation Evidence

- Added `docs/hybrid-search-architecture.md`.
- Added `.servo/worktrack/WT-20260529-078/contract.md`.
- Added `.servo/worktrack/WT-20260529-078/plan-task-queue.md`.
- No application source, Prisma schema, migration, package, or CI file was intentionally changed.

## Architecture Coverage

- PostgreSQL, `pgvector`, `pg_search`/BM25, and native PostgreSQL FTS fallback are explicitly separated by readiness gates.
- Query understanding, lexical search, vector search, RRF fusion, Context Window Builder, optional reranker seam, debug evidence, and evaluation harness boundaries are defined.
- SearchIndexProfile immutability and EmbeddingProviderConfig separation from AiProviderConfig are defined.
- Filtered pgvector recall/performance risks are recorded for WT-081 and WT-082.
- Current repo-local facts are linked to `prisma/schema.prisma`, `src/lib/knowledge/retrieval.ts`, `src/lib/ai/knowledge.ts`, `src/lib/ai/deepseek-provider.ts`, `src/lib/ai/draft-service.ts`, and `.github/workflows/ci.yml`.

## Validation Evidence

- `git diff --check`: pass.
- Targeted consistency search for `selected-scope`, `knowledgeBaseIds`, `citation truth`, `enabled=false`, `SearchIndexProfile`, `RRF`, `pg_search`, `pgvector`, source-code and Prisma-schema exclusions: pass.
- File-scope review: only `docs/hybrid-search-architecture.md` and `.servo/worktrack/WT-20260529-078/*` were added before closeout writeback.

## Policy Evidence

- Worktree discipline followed: work executed in `.worktrees/wt-20260529-078-hybrid-search-architecture` on branch `worktrack/wt-20260529-078-hybrid-search-architecture`.
- Dangerous operations not performed.
- No external hosted search, third-party vector database, production data migration, package install, PostgreSQL extension enablement, background job, or provider billing decision was made.
- AI manual-confirmation boundary preserved.
- The programmer's updated stop boundary is honored: stop after WT-078 closeout; do not continue WT-079 in this turn.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final_verdict: pass

## Residual Risks

- `pg_search`, `pgvector`, PostgreSQL version, extension install, and CI DB readiness remain unverified until later MS-9 worktracks.
- Native FTS Chinese tokenization strategy remains an implementation/readiness decision for WT-081/WT-082.
- PostgreSQL migration and Prisma provider changes remain out of this worktrack.
