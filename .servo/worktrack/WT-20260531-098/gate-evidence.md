# Gate Evidence: WT-20260531-098

## Metadata

- worktrack_id: WT-20260531-098
- title: 本地开源 Embedding 模型 Docker/CPU 可行性研判
- milestone_id: MS-10
- branch: worktrack/wt-20260531-098-local-embedding-docker-feasibility
- status: gate-passed

## Research Evidence

- Report: `docs/local-embedding-docker-feasibility.md`.
- Current repo fit: `EmbeddingProvider` already supports a server-side adapter seam; `SearchIndexProfile` locks provider/model/dimensions; pgvector HNSW indexes already cover 1024 dimensions.
- External facts checked: Hugging Face Text Embeddings Inference CPU deployment docs; TEI supported model list; Hugging Face model cards for Qwen3-Embedding-0.6B and intfloat/multilingual-e5-large.

## Verdict

- Feasible, but recommended only as a sidecar embedding service with model weights in an image layer or deployment-managed cache, not inside the Next.js application image.
- CPU inference is acceptable for low-throughput admin indexing and query embedding; it is not acceptable as an unbounded synchronous user-path dependency without queueing, concurrency limits, and latency benchmarks.

## Validation Evidence

- `git diff --check` passed.
- `npm run lint` passed.
- Report placeholder scan completed; only `latest` appears inside a deliberately non-production example and is explicitly rejected for production pinning.

## Gate Surfaces

- research-gate: evidence-collected.
- validation-gate: pass.
- policy-gate: pass.
- gate_verdict: pass.
