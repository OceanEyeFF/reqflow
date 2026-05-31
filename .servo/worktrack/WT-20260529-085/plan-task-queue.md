# Plan / Task Queue: WT-20260529-085

## Metadata

- worktrack_id: WT-20260529-085
- title: Embedding 生成与 pgvector 索引
- milestone_id: MS-10
- branch: worktrack/wt-20260529-085-embedding-pgvector-index
- status: seeded
- created_at: 2026-05-31

## Queue

### T1: Schema And Migration

- status: pending
- task: Add pgvector-compatible KnowledgeEmbedding storage and index migration while preserving WT-083 fields.
- acceptance: Prisma generate/validate passes and migration has non-destructive rollback notes.

### T2: Embedding Provider Runtime

- status: pending
- task: Implement server-side embedding provider interfaces, active profile resolution, deterministic fake provider, and fail-closed generation/upsert flow.
- acceptance: Tests prove provider/profile/dimension guardrails and deterministic output.

### T3: Vector Candidate Retrieval

- status: pending
- task: Add active-profile-scoped vector candidate retrieval with explainable evidence and no fusion behavior.
- acceptance: Tests prove same-profile filtering, profile mismatch rejection, and evidence shape.

### T4: Documentation And Evidence

- status: pending
- task: Document WT-085 embedding/pgvector behavior, rollback notes, and gate evidence.
- acceptance: Docs identify vector profile invariants, readiness assumptions, and deferred scopes.

### T5: Validation

- status: pending
- task: Run focused and full validation suite required by the contract.
- acceptance: Gate evidence records command results and any environment-specific warnings.

## Current Next Action

- Implement T1 and T2 in the WT-085 worktree.

## Blocking Items

- N/A
