# MS-14 Chinese Tokenization Compatibility Evaluation

## Metadata

- milestone: MS-14
- worktrack: WT-20260601-120
- updated: 2026-06-01
- status: tokenizer evidence synthesis

## Purpose

This report synthesizes Chinese tokenization evidence from the checked-in
MS-14 benchmark artifacts. It does not run new containers, change benchmark
thresholds, or recommend a default runtime switch.

The current accepted default runtime remains `pgvector/pgvector:0.8.2-pg16`
with native PostgreSQL FTS fallback, pgvector, and RRF-style hybrid retrieval.
BM25 remains candidate evidence only.

## Evidence Sources

| Source | Role |
| --- | --- |
| `docs/ms14-bm25-benchmark-corpus.json` | Chinese corpus, tokenization focus terms, expected snippets, forbidden traps. |
| `docs/ms14-bm25-benchmark-baseline-results.json` | Native FTS schema-fixture baseline shape; not measured runtime evidence. |
| `docs/ms14-paradedb-pg-search-results.json` | Measured ParadeDB `pg_search` candidate result. |
| `docs/ms14-vectorchord-bm25-results.json` | Measured VectorChord-BM25 / `pg_tokenizer` candidate result. |
| `docs/ms14-pg-textsearch-compat-results.json` | `pg_textsearch` availability evidence in tested PostgreSQL 18 image. |

## Summary Verdict

| Candidate | Tokenizer evidence | Chinese compatibility signal | Caveat for WT-121 |
| --- | --- | --- | --- |
| ParadeDB `pg_search` | `pdb.unicode default`, mixed segmentation, readable query tokens. | Strongest current measured signal: all six corpus cases returned expected snippets in the required top-k window. | Pure Chinese token evidence often appears as a whole query or coarse phrase, so this PoC does not prove word-level Chinese segmentation. WT-121 should treat it as ranking-compatible, not as tokenizer-final. |
| VectorChord-BM25 / `pg_tokenizer` | `ms14_jieba`, word mode, `bm25vector` token IDs. | Runtime and index path work, and most Chinese/mixed cases produced relevant top results. | Token IDs are not human-readable tokenizer boundaries in the result file; synonym case missed one expected snippet at top 5. WT-121 should keep this as `defer` unless tokenizer/query tuning closes the synonym gap. |
| `pg_textsearch` | No tokenizer result; extension unavailable in tested image. | No compatibility conclusion can be drawn. | Needs a packaged runtime path before Chinese tokenization or BM25 ranking can be evaluated. |
| Native FTS baseline fixture | `postgres-simple`, simple segmentation fixture. | Useful control shape for corpus and policy gates. | Not measured performance evidence and not BM25. Chinese segmentation is intentionally a weak baseline. |

## Corpus Coverage Reviewed

The synthesis reviewed all six WT-116 cases:

- pure Chinese business phrases: `一般耗材标准检验出库`, `质检抽样`, `异常退回`, `内仓`, `外仓`, `责任边界`;
- mixed Chinese-English terms: `QC sampling`, `SKU`, `ERP`, `SOP`, `AI draft`;
- zip/source path terms: `流程包.zip`, `uploads/2026`, `标准检验出库`;
- synonym or near-synonym terms: `质检抽样`, `QC取样`, `检验取样`, `检验后出库`;
- negative traps: disabled legacy `免检直接出库` content and unrelated UI content.

## Candidate Findings

### ParadeDB `pg_search`

Runtime evidence from `docs/ms14-paradedb-pg-search-results.json`:

- PostgreSQL `18.4`, `pg_search` `0.23.5`, `vector` `0.8.1`.
- BM25 candidate path was measured in an isolated temporary container.
- Index build on the 12-snippet fixture: `346.152 ms`.
- Query plan used `Custom Scan (ParadeDB Base Scan)` and `TopKScanExecState`.
- Result file records no default runtime mutation and no destructive action.

Tokenizer and ranking observations:

| Case | Tokenization signal | Ranking signal |
| --- | --- | --- |
| Pure Chinese outbound | Query token recorded as one full Chinese string. | Expected snippets ranked 1 and 2. |
| Mixed `QC sampling` / `SKU` / `ERP` | Latin tokens split/readable; Chinese fragments remain coarse. | Expected ERP and QC snippets ranked 1 and 2. |
| Warehouse responsibility | Query token recorded as one full Chinese string. | Expected snippets ranked 1 and 2. |
| Zip path citation | `流程包` and `zip` split around punctuation. | Zip source ranked 1. |
| Synonym/QC sampling | Coarse Chinese phrases plus `QC取样` retained as readable token text. | All three expected snippets ranked within top 5. |
| Disabled legacy trap | Query token recorded as one full Chinese string. | Disabled legacy source did not appear in top-k; allowed snippets ranked 1 and 2. |

ParadeDB's main compatibility strength is that ranking succeeded across the
current Chinese corpus despite coarse token evidence. The main risk is that
`pdb.unicode default` in this PoC does not demonstrate word-level segmentation
for domain phrases. If MS-14 later considers ParadeDB for enablement, a follow-up
should compare `pdb.unicode default` with ParadeDB's Chinese-compatible tokenizer
or an equivalent configured tokenizer on the same fixtures.

### VectorChord-BM25 / `pg_tokenizer`

Runtime evidence from `docs/ms14-vectorchord-bm25-results.json`:

- PostgreSQL `18.3`, `pg_tokenizer` `0.1.1`, `vchord_bm25` `0.3.0`, `vector` `0.8.2`.
- BM25 candidate path was measured in an isolated temporary container.
- Index build on the 12-snippet fixture: `386.583 ms`.
- Query path used `tokenize(..., 'ms14_jieba')`, `to_bm25query(...)`, and the `<&>` operator.
- Result file records no default runtime mutation and no destructive action.

Tokenizer and ranking observations:

| Case | Tokenization signal | Ranking signal |
| --- | --- | --- |
| Pure Chinese outbound | `ms14_jieba` produced `bm25vector` token IDs. | Expected snippets ranked 1 and 3. |
| Mixed `QC sampling` / `SKU` / `ERP` | Token IDs prove the query entered the tokenizer path, but the result file does not decode term boundaries. | Expected snippets ranked 1 and 3. |
| Warehouse responsibility | Token IDs only. | Expected snippets ranked 1 and 4. |
| Zip path citation | Token IDs only; query plan shows zip/path query text passed through tokenizer. | Zip source ranked 1. |
| Synonym/QC sampling | Token IDs only. | Two expected snippets ranked top 5; `snip-direct-outbound-allowed` ranked 7, failing the Recall@5 gate. |
| Disabled legacy trap | Token IDs only. | Disabled legacy source did not appear in top-k; allowed snippets ranked 1 and 2. |

VectorChord's main compatibility strength is explicit tokenizer integration via
`pg_tokenizer` and a working BM25 index/query path. Its main risk is that the
checked-in tokenizer evidence is not directly auditable by a human reviewer:
the token list contains internal numeric terms rather than words such as
`质检抽样` or `标准检验出库`. The synonym miss also suggests query expansion,
dictionary tuning, or ranking configuration would be needed before adoption.

### `pg_textsearch`

Runtime evidence from `docs/ms14-pg-textsearch-compat-results.json`:

- Tested image: `postgres:18`.
- PostgreSQL version: `18.4`.
- `shared_preload_libraries`: empty.
- `pg_textsearch` was not listed in `pg_available_extensions`.
- `CREATE EXTENSION pg_textsearch` was not attempted because the extension was unavailable.
- Candidate decision remains `defer`.

No Chinese tokenizer compatibility finding is possible yet. The next valid step
would be a custom image or package path that exposes `pg_textsearch`, including
its preload requirements, before running the WT-116 corpus.

### Native FTS Baseline Fixture

Runtime evidence from `docs/ms14-bm25-benchmark-baseline-results.json`:

- Engine: `postgres-native-fts-fallback`.
- Measurement mode: `schema-fixture`.
- BM25 enabled: `false`.
- Runtime image named as current baseline: `pgvector/pgvector:0.8.2-pg16`.

The fixture is useful for validating the benchmark contract and for preserving
the expected fallback behavior shape. It is not measured runtime evidence and
should not be interpreted as a BM25 result. Its `postgres-simple` tokenization
keeps many Chinese phrases as coarse strings and remains a weak Chinese
segmentation baseline.

## Cross-Candidate Tokenizer Risks

1. Coarse Chinese segmentation can still pass a compact corpus when exact
   phrases appear in documents, but may degrade recall on reordered or partial
   business phrases.
2. Mixed Chinese-English terms need explicit treatment. `QC sampling`, `SKU`,
   and `ERP` behaved acceptably in the measured candidates, but `QC取样` and
   similar fused terms remain sensitive to tokenizer dictionaries.
3. Source paths need punctuation-aware handling. ParadeDB exposed readable
   `流程包` / `zip` tokens; VectorChord ranked the zip source correctly, but the
   recorded token IDs do not show whether path segments are preserved as desired.
4. Synonyms are not solved by BM25 itself. The VectorChord synonym miss shows
   that lexical BM25 still needs query expansion, curated vocabulary, or hybrid
   retrieval support for ReqFlow's business-language cases.
5. Candidate scores are not comparable. ParadeDB records positive scores while
   VectorChord records negative distance-like scores. WT-121 must continue using
   rank-derived metrics and RRF-style fusion, not raw score addition.
6. Source exclusion must stay outside tokenizer trust. Both measured candidates
   avoided disabled legacy content in top-k, but this should remain enforced by
   SQL filters and knowledge-base selection, not by ranking behavior.

## WT-121 Inputs

WT-121 should carry forward these caveats:

- Treat ParadeDB as the leading measured BM25 candidate for ranking comparison,
  while explicitly noting that this PoC used `pdb.unicode default` and does not
  settle Chinese word segmentation quality.
- Treat VectorChord as a working but deferred candidate unless the synonym
  Recall@5 failure is addressed or accepted as a known limitation.
- Treat `pg_textsearch` as unavailable in the tested runtime and exclude it from
  accuracy/performance comparison unless a packaged extension image is added in
  a new worktrack.
- Keep native FTS baseline labels precise: fallback/control, not BM25.
- Compare top-k ranks, Recall@5/10, Precision@5, first relevant rank, local
  latency, index build time, and EXPLAIN evidence without mixing raw scores
  across engines.

## Non-Claims

- WT-120 did not run new containers.
- WT-120 did not modify `docker-compose.runtime.yml`.
- WT-120 did not mutate volumes, uploads, model cache, or existing database state.
- WT-120 does not enable BM25 in the default runtime.
- WT-120 does not make a final MS-14 adoption decision.
