import { describe, expect, it, vi } from "vitest";
import {
  createHttpEmbeddingProvider,
  createHttpEmbeddingProviderFromConfig,
  HttpEmbeddingProviderError,
} from "./embedding-http-provider";

describe("createHttpEmbeddingProvider", () => {
  it("calls an OpenAI-compatible embedding endpoint and returns provider-scoped vectors", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ data: [{ embedding: [0.1, 0.2, 0.3] }] }));
    const provider = createHttpEmbeddingProvider({
      name: "local-cpu-sidecar",
      baseUrl: "http://127.0.0.1:8081",
      apiKey: "test-key",
      fetchImpl,
    });

    await expect(provider.embed({ input: "审批流程", model: "intfloat/multilingual-e5-large", dimensions: 3 })).resolves.toEqual({
      provider: "local-cpu-sidecar",
      model: "intfloat/multilingual-e5-large",
      dimensions: 3,
      vector: [0.1, 0.2, 0.3],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/v1/embeddings"),
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer test-key" },
        body: JSON.stringify({ model: "intfloat/multilingual-e5-large", input: "审批流程" }),
      })
    );
  });

  it("supports TEI /embed-style request and response shapes", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([[0.1, 0.2, 0.3]]));
    const provider = createHttpEmbeddingProvider({
      name: "local-cpu-sidecar",
      baseUrl: "http://embedding:80",
      path: "/embed",
      requestFormat: "tei",
      fetchImpl,
    });

    await expect(provider.embed({ input: "报销规则", model: "Qwen/Qwen3-Embedding-0.6B", dimensions: 3 })).resolves.toMatchObject({
      provider: "local-cpu-sidecar",
      vector: [0.1, 0.2, 0.3],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("http://embedding/embed"),
      expect.objectContaining({ body: JSON.stringify({ inputs: "报销规则" }) })
    );
  });

  it("fails closed when the sidecar returns the wrong number of dimensions", async () => {
    const provider = createHttpEmbeddingProvider({
      name: "local-cpu-sidecar",
      baseUrl: "http://127.0.0.1:8081",
      fetchImpl: vi.fn(async () => jsonResponse({ data: [{ embedding: [0.1, 0.2] }] })),
    });

    await expect(provider.embed({ input: "审批流程", model: "m", dimensions: 3 })).rejects.toMatchObject({
      code: "dimensions-mismatch",
    });
  });

  it("fails closed on non-2xx responses and malformed vectors", async () => {
    const failedProvider = createHttpEmbeddingProvider({
      name: "local-cpu-sidecar",
      baseUrl: "http://127.0.0.1:8081",
      fetchImpl: vi.fn(async () => jsonResponse({ error: "bad" }, 500)),
    });
    await expect(failedProvider.embed({ input: "审批流程", model: "m", dimensions: 3 })).rejects.toMatchObject({
      code: "request-failed",
    });

    const malformedProvider = createHttpEmbeddingProvider({
      name: "local-cpu-sidecar",
      baseUrl: "http://127.0.0.1:8081",
      fetchImpl: vi.fn(async () => jsonResponse({ data: [{ embedding: [0.1, Number.NaN, 0.3] }] })),
    });
    await expect(malformedProvider.embed({ input: "审批流程", model: "m", dimensions: 3 })).rejects.toMatchObject({
      code: "malformed-response",
    });
  });

  it("validates baseUrl before creating the provider", () => {
    expect(() => createHttpEmbeddingProvider({ name: "local", baseUrl: "" })).toThrow(HttpEmbeddingProviderError);
  });

  it("creates providers from EmbeddingProviderConfig-shaped values", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ data: [{ embedding: [0.1, 0.2, 0.3] }] }));
    const provider = createHttpEmbeddingProviderFromConfig(
      {
        provider: "local-cpu-sidecar",
        baseUrl: "http://127.0.0.1:8081",
        apiKey: "ignored-in-no-key-mode",
        noKeyMode: true,
      },
      { fetchImpl }
    );

    await expect(provider.embed({ input: "审批流程", model: "m", dimensions: 3 })).resolves.toMatchObject({
      provider: "local-cpu-sidecar",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ headers: { "content-type": "application/json" } })
    );
  });
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
