# Local Embedding Sidecar PoC

## Status

WT-20260531-100 adds an optional local CPU embedding sidecar integration path. It does not make the sidecar the default provider and does not bundle model weights into the main Next.js application image.

Use this only for local PoC validation unless a later production deployment worktrack approves the model, image, hardware, indexing queue, and reindex plan.

## What Was Added

- `src/lib/knowledge/embedding-http-provider.ts`: HTTP `EmbeddingProvider` adapter for OpenAI-compatible `/v1/embeddings` and TEI-style `/embed` response shapes.
- `docker-compose.embedding.yml`: optional Text Embeddings Inference CPU sidecar service.
- `npm run embedding:probe`: sidecar latency/dimension probe for manual runs.
- Tests for request shape, response parsing, provider config mapping, non-2xx responses, malformed vectors, and fail-closed provider exceptions.

## Optional Sidecar Startup

Start PostgreSQL and the embedding sidecar separately:

```bash
docker compose -f docker-compose.postgres.yml up -d postgres
docker compose -f docker-compose.embedding.yml up -d embedding
```

The compose file uses a named model cache volume:

```text
reqflow-embedding-model-cache
```

Model downloads can be large and slow. They are intentionally not part of normal tests or CI.

The CPU image tag follows the Hugging Face TEI supported hardware table for x86_64 CPU images. Re-check the tag before production pinning and prefer an immutable digest when promotion beyond PoC is approved.

## Probe Command

Run a manual sidecar probe after the container is healthy:

```bash
$env:LOCAL_EMBEDDING_BASE_URL="http://127.0.0.1:8081"
$env:LOCAL_EMBEDDING_PATH="/embed"
$env:LOCAL_EMBEDDING_REQUEST_FORMAT="tei"
$env:LOCAL_EMBEDDING_MODEL="intfloat/multilingual-e5-large"
$env:LOCAL_EMBEDDING_DIMENSIONS="1024"
npm run embedding:probe
```

The probe prints JSON with endpoint, model, dimensions, iteration count, and min/p50/p95/max latency. It fails if the returned vector dimensions do not match `LOCAL_EMBEDDING_DIMENSIONS`.

## Provider/Profile Boundary

Runtime use still depends on existing MS-10 invariants:

- `EmbeddingProviderConfig.provider` must match `SearchIndexProfile.embeddingProvider`.
- `EmbeddingProviderConfig.model` must match `SearchIndexProfile.embeddingModel`.
- `EmbeddingProviderConfig.dimensions` must match `SearchIndexProfile.embeddingDimensions`.
- Only one ready active `SearchIndexProfile` may be active.
- Changing model or dimensions requires a new profile and re-embedding.

Recommended local PoC identity:

| Field | Value |
|-------|-------|
| provider | `local-cpu-sidecar` |
| model | `intfloat/multilingual-e5-large` |
| dimensions | `1024` |
| semanticSpace | `local-cpu-sidecar:intfloat-multilingual-e5-large:<revision>` |
| lexicalEngine | `postgres-native-fts-fallback` |

The current schema stores provider/profile rows but does not include an admin UI for embedding provider setup. Use a focused setup script or Prisma Studio in a future worktrack if operator self-service is required.

## Failure Behavior

The sidecar path fails closed when:

- base URL is missing;
- the HTTP request times out;
- sidecar returns non-2xx;
- response has no supported vector shape;
- vector contains non-finite values;
- vector dimensions do not match the active profile;
- provider/model identity does not match the active profile.

Failures are recorded as provider/vector-lane failure evidence and should degrade retrieval rather than bypassing filters or sending unbounded context to the AI provider.

## Production Boundary

Before production enablement, a separate worktrack must cover:

- pinned image digest and model revision;
- model license review;
- memory, cold-start, p50/p95 latency, and batch throughput benchmark;
- background queue or admin-only reindex workflow;
- readiness/health checks and timeout limits;
- rollback and reindex plan;
- retrieval quality gate using `npm run retrieval:evaluate`.

Do not copy model weights into the main app image by default.

## Sources

- Hugging Face Text Embeddings Inference CPU local guide: https://huggingface.co/docs/text-embeddings-inference/local_cpu
- Hugging Face Text Embeddings Inference supported models and hardware: https://huggingface.co/docs/text-embeddings-inference/supported_models
