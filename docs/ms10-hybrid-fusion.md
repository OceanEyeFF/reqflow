# MS-10 Hybrid Fusion Runtime

## Scope

WT-20260529-086 adds a hybrid retrieval API that combines the lexical lane from WT-084 and the vector lane from WT-085. It does not implement context window expansion, AI draft integration, admin debug UI, broad retrieval evaluation expansion, or an external reranker provider.

## API Boundary

- `selectKnowledgeSnippets()` remains lexical-only and keeps the existing citation API used by current AI draft callers.
- `retrieveKnowledgeSnippets()` remains the lexical retrieval API with lexical evidence.
- `retrieveHybridKnowledgeSnippets()` is the new hybrid API for callers that need fused ranking evidence.

## Fusion Rule

Hybrid ranking uses reciprocal rank fusion:

```text
rrf_score = 1 / (k + lexical_rank) + 1 / (k + vector_rank)
```

The current `k` is `60`. Missing lanes contribute `0`. Raw lexical scores and vector similarity scores are preserved as evidence only; they are not added together.

## Evidence

Hybrid evidence records:

- query understanding;
- lexical retrieval evidence;
- vector lane status or fail-closed reason;
- vector hits;
- fused hits with lexical rank, vector rank, fused rank, RRF contribution, and component raw scores;
- reranker seam status.

## Reranker Seam

The reranker seam is optional and no-op by default. Tests can inject an in-process reranker, but WT-086 does not call any external reranking provider or require provider billing/privacy decisions.

## Degradation

When vector retrieval fails, hybrid retrieval returns lexical-only fused evidence instead of crashing lexical retrieval. The failure reason remains visible in `debugEvidence.vectorLane`.
