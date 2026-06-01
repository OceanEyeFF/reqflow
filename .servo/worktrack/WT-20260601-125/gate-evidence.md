# Gate Evidence: WT-20260601-125

## Metadata

- worktrack_id: WT-20260601-125
- milestone_id: MS-15
- status: in validation
- updated: 2026-06-01

## Implementation Evidence

- Added `npm run paradedb:candidate-benchmark`.
- Added `scripts/paradedb-candidate-benchmark.mjs`, a compose-aware benchmark runner that targets `docker-compose.paradedb.yml` via `docker compose exec -T postgres psql`.
- Added `docs/ms15-paradedb-candidate-benchmark-results.json` with measured MS-15 candidate runtime results.
- Added `docs/ms15-paradedb-pg-search-tokenizer-benchmark.md` with command, cleanup, tokenizer, and measured-result documentation.
- Added WT-125 control artifacts.
- Did not run the old `npm run paradedb:poc` as WT-125 evidence.
- Did not modify `docker-compose.runtime.yml`.
- Did not enable ParadeDB as the default runtime.
- Explorer sidecar performed read-only reuse/risk analysis and reported no file changes.

## Runtime Target Evidence

- Candidate compose service started with `docker compose -f docker-compose.paradedb.yml up -d postgres`.
- Benchmark targeted the candidate compose `postgres` service, not `paradedb/paradedb:latest` via `docker run`.
- Benchmark objects were isolated under schema `ms15_pg_search_benchmark`.
- Cleanup was limited to `DROP SCHEMA IF EXISTS "ms15_pg_search_benchmark" CASCADE` inside the candidate database.
- Candidate service stopped with `docker compose -f docker-compose.paradedb.yml stop postgres`.
- No Docker volumes, uploads, model cache, or default runtime data were deleted.

## Benchmark Evidence

- `npm run paradedb:candidate-benchmark`: pass.
- `npm run bm25:evaluate -- docs/ms14-bm25-benchmark-corpus.json docs/ms15-paradedb-candidate-benchmark-results.json`: pass.
- Candidate ID: `paradedb-pg-search-ms15-candidate-runtime`.
- PostgreSQL version: `18.4 (Debian 18.4-1.pgdg13+1)`.
- `pg_search`: `0.23.5`.
- `vector`: `0.8.1`.
- Corpus size: 6 cases / 12 snippets.
- BM25 index build: `581.23ms`.
- BM25 index size: `3022848` bytes.
- Every case recorded EXPLAIN evidence with `Custom Scan (ParadeDB Base Scan)` and `ms15_docs_bm25_idx`.

## Case Result Summary

| Case | Top result | p50 | p95 |
| --- | --- | ---: | ---: |
| `ms14-consumables-standard-outbound` | `snip-consumables-standard-inspection` | `289.535ms` | `304.868ms` |
| `ms14-qc-sampling-mixed-language` | `snip-erp-sync-sku` | `272.871ms` | `287.311ms` |
| `ms14-warehouse-responsibility-boundary` | `snip-consumables-warehouse-boundary` | `281.317ms` | `285.737ms` |
| `ms14-zip-path-source-citation` | `snip-zip-path-consumables` | `280.698ms` | `286.694ms` |
| `ms14-synonym-qc-sampling` | `snip-qc-sampling-ratio` | `283.562ms` | `286.703ms` |
| `ms14-negative-disabled-legacy` | `snip-direct-outbound-allowed` | `271.003ms` | `293.002ms` |

## Tokenizer Evidence

- Tested tokenizer label: `pdb.unicode default`.
- Segmentation mode recorded as `mixed`.
- The benchmark passed the corpus ranking gates, including pure Chinese, mixed Chinese-English, business terms, source path/citation, synonym, negative-trap, and citation cases.
- Caveat: pure Chinese query token evidence is still coarse and can appear as whole phrases. WT-125 proves ranking compatibility for the corpus, not final word-level Chinese segmentation quality.

## Regression Evidence

- `npm ci`: pass.
- `node --check scripts/paradedb-candidate-benchmark.mjs`: pass.
- `npm run lint`: pass.
- `npm run test`: pass, 33 files / 257 tests.
- `npm run build`: pass.
- `git diff --check`: pass.
- Targeted policy scan: pass; matches are explicit no-claim/no-destructive boundary statements.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-125-paradedb-pg-search-tokenizer`.
- Default runtime remains unchanged.
- BM25 remains candidate runtime evidence only.
- No production data or local zip corpora were imported.
- No default runtime switch, volume deletion, or retrieval-fusion change was made.

## Gate Verdict

- implementation-gate: pass
- benchmark-gate: pass
- tokenizer-evidence-gate: pass with caveat
- regression-gate: pass
- policy-gate: pass
- final: pass
