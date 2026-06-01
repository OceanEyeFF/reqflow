# MS-14 BM25 Benchmark Harness

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-116
- updated: 2026-06-01
- status: benchmark contract

## Purpose

This harness defines the repeatable Chinese corpus and result contract that
BM25 candidate PoCs must use before MS-14 compares plugin quality or recommends
any future runtime option.

It is not a runtime switch and it does not prove that BM25 is active.

## Files

- Corpus: `docs/ms14-bm25-benchmark-corpus.json`
- Schema fixture result: `docs/ms14-bm25-benchmark-baseline-results.json`
- Gate script: `scripts/bm25-benchmark-gate.mjs`
- Package command: `npm run bm25:evaluate`

## Commands

Validate only the corpus:

```bash
npm run bm25:evaluate
```

Validate a result file:

```bash
node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json path/to/results.json
```

Validate the checked-in schema fixture:

```bash
node scripts/bm25-benchmark-gate.mjs docs/ms14-bm25-benchmark-corpus.json docs/ms14-bm25-benchmark-baseline-results.json
```

## Corpus Coverage

The MS-14 corpus intentionally covers:

- pure Chinese business phrases such as `一般耗材标准检验出库`, `质检抽样`, `异常退回`, `内仓`, `外仓`, and `责任边界`;
- mixed Chinese-English tokens such as `QC sampling`, `ERP`, `SOP`, `SKU`, and `AI draft`;
- source and zip path evidence such as `uploads/2026/流程包.zip/仓储/耗材/标准检验出库.txt`;
- synonym/near-synonym behavior such as `质检抽样`, `QC取样`, `检验取样`, `标准检验出库`, and `检验后出库`;
- negative traps such as disabled legacy `免检直接出库` content and unrelated UI content.

## Result Contract

Each candidate result file must include:

- `run.candidateId`, `engine`, `candidateClass`, `measurementMode`, PostgreSQL version, runtime image, and extension status;
- index performance metrics: index build time, index size when available, document count, and snippet count;
- policy evidence proving no default runtime mutation, no destructive action, no raw-score fusion, and whether the run used an isolated runtime;
- one result per corpus case;
- top-k ranked hits with `rank`, `sourceId`, `snippetId`, and optional score;
- tokenizer evidence with tokenizer name, segmentation mode, query tokens, and behavior for every focused Chinese/business term;
- query performance metrics: first query, warm query, p50, p95, LIMIT 5, LIMIT 10, LIMIT 20, and sample size;
- EXPLAIN evidence or an explicit not-available summary.

The gate derives metrics from top-k hits:

- Recall@5;
- Recall@10;
- Precision@5;
- first relevant rank / MRR input.

Self-reported recall, precision, or MRR fields are ignored by design.
Result files must return at least five ranked hits per case so Precision@5 is
not inflated by returning only one or two obviously relevant snippets.

## Measurement Modes

`measurementMode: schema-fixture` is allowed only for checked-in schema examples
or dry-run contract validation. It is not performance evidence.

`measurementMode: measured` is required for candidate PoCs. Measured runs must
include at least three query samples per case so p50/p95 are meaningful enough
for local comparison.

Local numbers remain local benchmark evidence, not production capacity claims.

## Candidate Usage

WT-117, WT-118, and WT-119 should each produce one result JSON file in this
shape after their isolated runtime compatibility gates pass.

WT-120 should consume tokenizer evidence from those files.

WT-121 should consume the top-k rankings and performance metrics to compare:

- native PostgreSQL FTS fallback;
- BM25 candidate lexical-only results;
- existing hybrid retrieval where feasible.

## Non-Claims

- This harness does not enable BM25.
- The baseline schema fixture does not prove native FTS quality or performance.
- PostgreSQL native FTS is still not BM25.
- Any default runtime change remains a separate fdch0 decision after MS-14 evidence.
