# Retrieval Evaluation Harness

## Metadata

- worktrack: WT-20260529-082
- milestone: MS-9
- updated: 2026-05-31

## Purpose

This document defines the fixed Chinese retrieval evaluation corpus and quality gate contract for later hybrid retrieval implementation. It is a gate surface, not a retriever implementation.

## Corpus

The canonical case file is:

```text
docs/retrieval-evaluation-cases.json
```

Each case must include:

- `query`
- `selectedKnowledgeBaseIds`
- `expectedSourceIds`
- `expectedSnippetIds`
- `mustContainTerms`
- `forbiddenSourceIds`
- `minRecallAt5`
- `maxNoiseAt5`
- `citationTraceability`
- `tags`

The initial corpus covers lexical fallback, selected-scope filtering, semantic/fusion recall, disabled/archived source exclusion, and citation traceability.

## Gate Command

```bash
npm run retrieval:evaluate
```

Without a result file, the gate validates corpus shape and coverage. Future MS-10 retrieval implementations can pass a result file:

```bash
node scripts/retrieval-evaluation-gate.mjs docs/retrieval-evaluation-cases.json path/to/results.json
```

Expected result shape:

```json
{
  "results": [
    {
      "caseId": "cn-procurement-approval-flow",
      "recallAt5": 0.8,
      "noiseAt5": 0.2,
      "returnedSourceIds": ["src-procurement-policy"],
      "returnedSnippetIds": ["snip-procurement-materials"],
      "citationTraceabilityPassed": true
    }
  ]
}
```

## Quality Rules

- `recallAt5` must meet or exceed each case's `minRecallAt5`.
- `noiseAt5` must not exceed each case's `maxNoiseAt5`.
- Returned sources must not include any `forbiddenSourceIds`.
- Citation traceability must pass when required.
- A passing AI draft is not a substitute for passing retrieval results.
- Whole-knowledge-base prompt stuffing is not a valid retrieval result.

## MS-10 Handoff

MS-10 should make lexical-only, vector-only, and fusion result generation emit this result shape. Debug evidence should preserve enough detail to explain:

- lexical hits,
- vector hits,
- fused hits,
- filtered reasons,
- final context,
- citation mappings.

WT-082 intentionally does not implement those retrieval paths.
