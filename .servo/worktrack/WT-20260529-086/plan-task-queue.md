# Plan / Task Queue: WT-20260529-086

## Metadata

- worktrack_id: WT-20260529-086
- title: RRF Hybrid fusion、reranker seam 与 score evidence
- milestone_id: MS-10
- branch: worktrack/wt-20260529-086-hybrid-fusion-score-evidence
- status: seeded
- created_at: 2026-05-31

## Queue

### T1: Fusion Types And Evidence

- status: pending
- task: Define hybrid result/evidence types and RRF score component shape.
- acceptance: Evidence can explain lexical rank, vector rank, fused rank, and component contributions.

### T2: Hybrid Retrieval Orchestration

- status: pending
- task: Combine lexical retrieval and vector candidates without raw score addition, preserving current public lexical API.
- acceptance: Lexical-only callers remain compatible and hybrid callers receive fused candidates.

### T3: Reranker Seam

- status: pending
- task: Add an optional no-op reranker seam with explicit evidence that no external reranker ran.
- acceptance: Tests can inject a reranker without making it required.

### T4: Focused Tests And Docs

- status: pending
- task: Cover lexical-only, vector-only, overlapping hits, vector failure degradation, and no raw-score-add behavior; update docs and gate evidence.
- acceptance: Focused tests and docs prove scope and deferred boundaries.

### T5: Validation

- status: pending
- task: Run required validation suite.
- acceptance: Gate evidence records command results and warnings.

## Current Next Action

- Implement T1 and T2.

## Blocking Items

- N/A
