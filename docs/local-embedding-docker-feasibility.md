# Local Embedding Docker Feasibility

## Verdict

Packaging an open-source embedding model around 0.5B parameters for CPU inference is feasible for ReqFlow, but it should be deployed as a separate embedding sidecar service, not bundled into the main Next.js application image.

Recommended path:

- Run a local embedding HTTP service in Docker Compose.
- Keep model identity in `EmbeddingProviderConfig` and `SearchIndexProfile`.
- Use a fixed model revision and a named Docker volume or prebuilt sidecar image layer for weights.
- Use CPU inference for admin indexing, reindex, and query embedding at modest throughput.
- Add queueing/concurrency limits before making it a hot synchronous user path.

Do not put model weights directly into the app image by default. It makes the app image huge, couples web deploys to model releases, slows CI/pull/deploy, and makes rollback/reindex boundaries unclear.

## Repo Fit

MS-10 already has the right integration seams:

- `src/lib/knowledge/embeddings.ts` defines `EmbeddingProvider`.
- `EmbeddingProviderConfig` is separate from `AiProviderConfig`.
- `SearchIndexProfile` locks provider, model, dimensions, and semantic space.
- `KnowledgeEmbedding` stores vectors in pgvector.
- Existing HNSW expression indexes cover 1024 dimensions, which matches several practical local embedding candidates.

This means local embedding should be introduced as a provider adapter and service configuration change, not as a rewrite of retrieval.

## Candidate Models

### Qwen/Qwen3-Embedding-0.6B

- Size: roughly 0.6B parameters.
- Output dimensions: 1024.
- Context length: model card states 32k context.
- Strength: current, multilingual, strong for retrieval-style embeddings.
- Fit: good technical fit for a 1024-dimension `SearchIndexProfile`.
- Risk: model is larger than classic sentence-transformer models; CPU latency and memory must be benchmarked on target hardware before enabling synchronous query paths.

### intfloat/multilingual-e5-large

- Size: roughly 0.6B parameters.
- Output dimensions: 1024.
- License: MIT on the model card.
- Strength: mature multilingual retrieval model; good fit for Chinese/English mixed knowledge bases.
- Limitation: model card notes 512 token input length.
- Fit: strong conservative candidate if document chunks are kept short.

### Smaller Alternative

If CPU latency is poor, evaluate 100M-300M class embedding models before accepting worse UX or larger infrastructure:

- bge-small / multilingual-e5-small style models;
- ONNX-quantized variants;
- domain-specific Chinese embedding models with permissive license.

These reduce memory and latency but may lower recall quality.

## Runtime Options

### Recommended: TEI Sidecar

Hugging Face Text Embeddings Inference documents local Docker deployment and CPU images. Its supported model list includes Qwen3 and XLM-RoBERTa family entries, which covers the likely 0.5B-0.6B class paths.

Benefits:

- clean HTTP boundary for the existing `EmbeddingProvider`;
- app image stays small;
- model service can be scaled, restarted, or replaced independently;
- model weights can be volume-cached or pre-baked into the sidecar image;
- easier to add health checks and timeout/retry behavior.

Operational shape:

```yaml
services:
  embedding:
    image: ghcr.io/huggingface/text-embeddings-inference:cpu-latest
    command: ["--model-id", "intfloat/multilingual-e5-large"]
    ports:
      - "8081:80"
    volumes:
      - embedding-model-cache:/data
```

The exact image tag and command should be pinned during implementation; `latest` is not acceptable for production.

### Acceptable: ONNX Runtime Sidecar

Use an ONNX-exported embedding model with CPU quantization and a thin HTTP service.

Benefits:

- potentially smaller runtime;
- better control over quantization and batching;
- can be easier to fit in constrained CPU environments.

Costs:

- more custom serving code;
- more model conversion and validation burden;
- more ways to drift from model-card behavior.

### Not Recommended: Bundle Weights Into Next.js App Image

This is technically possible but operationally poor:

- increases app image by multiple GB after framework/runtime/model layers;
- makes every app deploy a model deploy;
- makes vulnerability scanning and cache invalidation noisier;
- forces web runtime memory to include model-serving concerns;
- complicates rollback because `SearchIndexProfile` changes may require re-embedding.

## CPU Feasibility Boundary

CPU inference is feasible for:

- admin-triggered indexing and reindexing;
- low-volume query embeddings;
- local/offline deployments where privacy matters more than latency;
- small teams and modest knowledge-base sizes.

CPU inference is risky for:

- synchronous high-QPS user search;
- large bulk imports without a background queue;
- multi-tenant deployments without per-tenant limits;
- machines with low memory or shared CPU contention.

Before production enablement, benchmark:

- p50/p95 single query embedding latency;
- batch throughput for snippet indexing;
- resident memory after model load;
- cold-start time;
- Docker image pull size;
- model-cache storage size;
- retrieval quality against `docs/retrieval-evaluation-cases.json`.

## pgvector And Profile Implications

For 1024-dimensional models, current MS-10 pgvector migration already includes a 1024-dimensional HNSW expression index. That makes Qwen3-Embedding-0.6B and multilingual-e5-large compatible with current index shape.

If a model uses another dimension:

- create a new `SearchIndexProfile`;
- add or document the matching pgvector index strategy;
- re-embed snippets for the new profile;
- never mix vectors across profiles.

## Recommendation

Proceed with a follow-up implementation only after MS-10 acceptance:

1. Add a local embedding provider adapter using a TEI-compatible HTTP API.
2. Add `docker-compose.embedding.yml` as an optional local profile.
3. Pick one initial model, preferably `intfloat/multilingual-e5-large` for conservative licensing or `Qwen/Qwen3-Embedding-0.6B` for stronger long-context retrieval.
4. Pin model revision and image tag.
5. Add admin-only indexing/reindex command or queue before bulk generation.
6. Run CPU benchmark and retrieval evaluation before making it default.

Decision: feasible with sidecar; do not bundle into the main app image by default.

## Sources

- Hugging Face Text Embeddings Inference local CPU deployment documentation: https://huggingface.co/docs/text-embeddings-inference/local_cpu
- Hugging Face Text Embeddings Inference supported models documentation: https://huggingface.co/docs/text-embeddings-inference/supported_models
- Qwen/Qwen3-Embedding-0.6B model card: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- intfloat/multilingual-e5-large model card: https://huggingface.co/intfloat/multilingual-e5-large
