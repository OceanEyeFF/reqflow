# MS-14 BM25 Candidate Matrix And Evaluation Plan

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-115
- updated: 2026-06-01
- status: candidate plan

## Decision Frame

MS-14 is an evaluation milestone. It should answer whether a PostgreSQL BM25
plugin route is viable for ReqFlow, especially for Chinese retrieval, before
any default runtime change is proposed.

The current accepted baseline remains:

- default database image: `pgvector/pgvector:0.8.2-pg16`
- active lexical engine: `postgres-native-fts-fallback`
- vector lane: pgvector
- fusion: RRF-style hybrid retrieval
- BM25 status: target-runtime candidate, not active runtime behavior

## Candidate Classes

### BM25 Ranking Plugins

These candidates can provide BM25-style ranking directly inside PostgreSQL.

| Candidate | Current upstream signal | PostgreSQL/runtime implications | Chinese implications | MS-14 route |
| --- | --- | --- | --- | --- |
| ParadeDB `pg_search` | ParadeDB docs list `pg_search` as a pre-installed extension in the ParadeDB Docker image for full-text and hybrid search with BM25. ParadeDB also documents a `pdb.chinese_compatible` tokenizer that treats each CJK character as a token. | Likely easiest full BM25 Docker candidate because the image already packages `pg_search` and `pgvector`. Requires validating image tags, PostgreSQL version, extension availability, `CREATE EXTENSION`, index DDL, query syntax, and data-volume isolation. | Built-in Chinese-compatible tokenizer is simple and CJK-character based, so it may improve recall but may not represent word-level Chinese segmentation. Needs comparison against business terms like `质检取样`, `标准检验出库`, and source path terms. | WT-117 primary candidate. |
| Timescale/TigerData `pg_textsearch` | Upstream README describes PostgreSQL BM25 relevance-ranked search, top-k Block-Max WAND optimization, parallel index builds, and PostgreSQL 17/18 support. It requires `shared_preload_libraries = 'pg_textsearch'` before `CREATE EXTENSION`. | Current ReqFlow default runtime is PostgreSQL 16, so this candidate implies PostgreSQL 17/18 image work plus preload/restart handling. Query/index syntax differs from `pg_search`. | It works with PostgreSQL text search configurations. Chinese viability likely depends on providing an appropriate text search configuration such as tokenizer extensions; this is not automatically solved by `pg_textsearch`. | WT-119 compatibility candidate; likely blocked unless PostgreSQL 17/18 runtime is acceptable for PoC. |
| VectorChord-BM25 / `pg_tokenizer` | VectorChord-BM25 README describes a PostgreSQL BM25 ranking extension and recommends using it with `pg_tokenizer.rs`. Docs recommend `tensorchord/vchord-suite` images, which include `vchord`, `pg_tokenizer`, `vchord_bm25`, and `vector`. | Uses a different suite image, commonly PostgreSQL 17/18 tags. Requires validating extension versions, `CREATE EXTENSION pg_tokenizer`, `CREATE EXTENSION vchord_bm25`, tokenizer setup, index DDL, and query operators. | Strongest tokenizer-control candidate because BM25 depends on explicit `pg_tokenizer` configuration. Chinese support must be proven by tokenizer configs and fixtures, not assumed. | WT-118 primary candidate. |

### Chinese Tokenizer / Native FTS Helpers

These are not BM25 ranking engines by themselves, but they may be useful as
fallback comparators or as tokenizer dependencies for BM25 candidates.

| Candidate | Current upstream signal | Role in MS-14 | Risk |
| --- | --- | --- | --- |
| `zhparser` | Upstream README describes a PostgreSQL extension for Mandarin Chinese full-text search based on SCWS, with Docker tags such as `zhparser/zhparser:bookworm-16` and PostgreSQL 9.2+ support. | Native FTS Chinese comparator and possible tokenization baseline for non-BM25 fallback evaluation. | Not BM25. Custom dictionary and config can affect repeatability. Docker image is separate from the current pgvector image. |
| `pg_jieba` | Upstream README describes a PostgreSQL Chinese full-text search extension using jieba-style configs, with dictionary and optional preload settings. | Native FTS Chinese comparator or reference tokenizer behavior. | Not BM25. Project age, PostgreSQL version support, build complexity, and preload/dictionary handling need caution. |
| PostgreSQL built-in `simple` / current native FTS fallback | Already accepted baseline in MS-12/MS-13. | Control group for all accuracy and performance comparisons. | Weak Chinese segmentation; useful as a baseline, not as a target quality bar. |

## Compatibility Gates

Every BM25 candidate PoC must record:

1. Docker image or build path, exact tag/digest where practical.
2. PostgreSQL major/minor version.
3. Extension availability in `pg_available_extensions`.
4. `CREATE EXTENSION` result in an isolated database/schema.
5. Required `shared_preload_libraries`, restart, or server settings.
6. Coexistence with `vector` / pgvector or an explicit reason it cannot coexist.
7. Minimal index DDL and representative query probe.
8. Explain-plan evidence for the representative query.
9. Failure and rollback behavior.
10. Whether the candidate can be tested without touching MS-13 default volumes.

Candidates that fail any of these gates can still be recorded as evaluated, but
they cannot be recommended for default runtime enablement.

## Chinese Evaluation Plan

WT-116 should create a repeatable corpus and query set before candidate PoCs
are compared. The corpus should include:

- Chinese business phrases from existing ReqFlow scenarios, including
  `一般耗材标准检验出库`, `质检抽样`, `QC取样`, `内仓`, `外仓`, `直接出库`,
  `标准检验`, `异常退回`, and `责任边界`.
- Mixed Chinese-English terms such as `QC sampling`, `ERP`, `SOP`, `SKU`, and
  `AI draft`.
- Source-path and zip-path snippets to ensure file path context does not break
  tokenization.
- Synonym/near-synonym pairs where exact term matching is insufficient.
- Negative queries that should not retrieve disabled/irrelevant content.

For each candidate, record:

- tokenizer output for representative Chinese strings;
- whether business terms are preserved as words, split into characters, or lost;
- query syntax required for Chinese terms;
- top-k result order for each query;
- missed expected hits and false positives;
- evidence of how disabled or out-of-scope content is excluded.

## Performance Plan

Performance should be measured locally but not overclaimed as production
performance.

Minimum metrics:

- index build time;
- index size if available;
- first-query latency and warm-query latency;
- p50/p95 latency over repeated query set;
- top-k query latency with `LIMIT 5`, `LIMIT 10`, and `LIMIT 20`;
- EXPLAIN / EXPLAIN ANALYZE evidence for representative queries;
- memory or server setting notes where the extension exposes them;
- candidate-specific startup/restart/preload overhead.

The comparison must include:

- native PostgreSQL FTS fallback;
- BM25 candidate lexical-only result;
- existing hybrid retrieval result where feasible.

## Accuracy Plan

Use a compact judgment file with expected relevant source/snippet IDs per query.

Minimum metrics:

- Recall@5 and Recall@10.
- Precision@5 when expected irrelevant traps exist.
- MRR or first relevant rank.
- Exact business term preservation notes.
- Failure case notes for tokenizer mismatch or phrase mismatch.

Do not use raw BM25 scores and vector similarity scores as directly additive
numbers. If a candidate proceeds to hybrid comparison, preserve the existing
RRF-style fusion invariant.

## Candidate Decision Criteria

Recommend `adopt as future runtime candidate` only if:

- compatibility gates pass;
- Chinese evaluation is materially better than native FTS fallback on business
  fixtures;
- performance is acceptable for local/admin retrieval workloads;
- extension setup is reproducible in Docker without destructive volume changes;
- rollback to MS-13 baseline is documented.

Recommend `defer` if:

- candidate quality looks promising but requires PostgreSQL major-version
  migration, custom image hardening, tokenizer dictionaries, or ranking
  integration work outside MS-14.

Recommend `reject for now` if:

- extension cannot be installed or created in an isolated runtime;
- Chinese behavior is worse than native fallback or too hard to configure;
- performance/operational complexity outweighs retrieval gains.

## Worktrack Execution Map

| Worktrack | Purpose | Must consume |
| --- | --- | --- |
| WT-116 | Build corpus and benchmark harness. | This plan's Chinese/performance/accuracy requirements. |
| WT-117 | ParadeDB `pg_search` PoC. | Compatibility gates and Chinese fixture set. |
| WT-118 | VectorChord-BM25 / `pg_tokenizer` PoC. | Compatibility gates and tokenizer output requirements. |
| WT-119 | `pg_textsearch` compatibility PoC. | PostgreSQL 17/18 and preload checks. |
| WT-120 | Cross-candidate Chinese tokenization report. | Tokenizer outputs from WT-116 through WT-119. |
| WT-121 | Accuracy/performance comparison. | Benchmark outputs from candidate PoCs. |
| WT-122 | Final decision report. | All candidate evidence and policy boundaries. |

## Non-Claims

- MS-14 has not enabled BM25.
- MS-14 has not replaced the MS-13 runtime.
- `zhparser` and `pg_jieba` are Chinese FTS/tokenizer helpers, not BM25 ranking
  plugins.
- Local benchmark numbers are not production capacity claims.

## Sources Checked

- ParadeDB Chinese-compatible tokenizer docs: https://docs.paradedb.com/documentation/tokenizers/available-tokenizers/chinese-compatible
- ParadeDB third-party extension docs: https://docs.paradedb.com/deploy/third-party-extensions
- Timescale/TigerData `pg_textsearch` README: https://github.com/timescale/pg_textsearch/blob/main/README.md
- VectorChord-BM25 README: https://github.com/tensorchord/VectorChord-bm25
- VectorChord Suite docs: https://docs.vectorchord.ai/vectorchord/getting-started/vectorchord-suite.html
- `zhparser` README: https://github.com/amutu/zhparser/blob/master/README.md
- `pg_jieba` README: https://github.com/jaiminpan/pg_jieba
