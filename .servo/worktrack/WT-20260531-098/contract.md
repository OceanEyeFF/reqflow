# Worktrack Contract: WT-20260531-098

## Metadata

- worktrack_id: WT-20260531-098
- title: 本地开源 Embedding 模型 Docker/CPU 可行性研判
- milestone_id: MS-10
- node_type: research
- status: active
- priority: 9
- branch: worktrack/wt-20260531-098-local-embedding-docker-feasibility
- baseline_branch: develop
- baseline_ref: 66f44c886498bd3c531f4dfe8dd74558a5dfbbce
- created_at: 2026-05-31
- created_by: harness-kernel

## Scope

### In Scope

- Evaluate whether a roughly 0.5B open-source embedding model can be packaged for Docker and CPU inference.
- Compare deployment options against current MS-10 `EmbeddingProvider` and `SearchIndexProfile` boundaries.
- Identify model candidates, image-size/runtime risks, CPU latency risks, licensing/security boundaries, and recommended next steps.
- Produce a repo-local decision report.

### Out of Scope

- Downloading or vendoring model weights into the repo.
- Adding a production Dockerfile or changing deployment topology.
- Implementing an embedding provider adapter.
- Running paid/cloud provider benchmarks.

## Acceptance Criteria

1. Report gives a clear feasibility verdict.
2. Report identifies at least one viable model/runtime path and one non-recommended path.
3. Report states Docker packaging, CPU inference, pgvector dimension/index, and operational implications.
4. Evidence includes source references and local validation.
