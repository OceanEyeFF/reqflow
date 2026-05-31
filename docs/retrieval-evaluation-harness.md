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
      "citationTraceabilityPassed": true,
      "retrievalMode": "hybrid-fusion",
      "debugEvidence": {
        "rawScoreAddition": false,
        "filterReasons": ["selected knowledge base: kb-procurement"],
        "vectorLane": { "status": "ready" },
        "fusedHits": [
          {
            "snippetId": "snip-procurement-materials",
            "fusedRank": 1,
            "rrf": {
              "lexicalContribution": 0.01639,
              "vectorContribution": 0.01613
            }
          }
        ],
        "contextWindow": {
          "maxContextChars": 1600,
          "contextChars": 420,
          "includedSnippetIds": ["snip-procurement-materials"]
        }
      }
    }
  ]
}
```

## Quality Rules

- The gate derives recall@5 from `expectedSourceIds` and `expectedSnippetIds` against returned top-5 IDs. Self-reported recall is ignored.
- The gate derives noise@5 from non-expected top-5 source IDs. Self-reported noise is ignored.
- Result files must contain exactly one result per known corpus case. Unknown or duplicate case IDs fail the gate.
- Returned source/snippet arrays are capped at 5 entries. A result cannot append extra sources after rank 5 to hide forbidden or unrelated context.
- All expected sources and snippets must appear in the top 5.
- All `mustContainTerms` must appear in `matchedTerms`.
- Returned sources must not include any `forbiddenSourceIds`.
- Citation traceability must pass when required.
- `retrievalMode` must be one of `lexical-only`, `vector-only`, `hybrid-fusion`, or `context-window`.
- The canonical result set must include coverage for all four retrieval modes.
- Hybrid evidence must prove RRF-style fused hits, vector lane readiness/failure, no raw score addition, filter reasons, context cap compliance, and alignment between returned top-5 snippets, fused hit evidence, and context membership.
- Provider failure and profile dimensions mismatch must both appear in canonical vector-lane failure evidence.
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

WT-088 adds the canonical MS-10 regression fixture:

```text
docs/retrieval-evaluation-ms10-results.json
```
