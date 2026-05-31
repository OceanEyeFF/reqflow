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
      "returnedSourceIds": ["src-procurement-policy"],
      "returnedSnippetIds": ["snip-procurement-materials"],
      "matchedTerms": ["采购", "审批", "材料", "复核"],
      "citationTraceabilityPassed": true
    }
  ]
}
```

## Quality Rules

- The gate derives recall@5 from `expectedSourceIds` and `expectedSnippetIds` against returned top-5 IDs. Self-reported recall is ignored.
- The gate derives noise@5 from non-expected top-5 source IDs. Self-reported noise is ignored.
- All expected sources and snippets must appear in the top 5.
- All `mustContainTerms` must appear in `matchedTerms`.
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
