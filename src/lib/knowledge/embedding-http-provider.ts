import type { EmbeddingProvider, EmbeddingProviderRequest, EmbeddingProviderResult } from "./embeddings";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_EMBEDDINGS_PATH = "/v1/embeddings";

export type HttpEmbeddingProviderOptions = {
  name: string;
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  path?: string;
  requestFormat?: "openai" | "tei";
  fetchImpl?: typeof fetch;
};

export type HttpEmbeddingProviderConfig = {
  provider: string;
  baseUrl: string | null;
  apiKey?: string | null;
  noKeyMode?: boolean;
};

export class HttpEmbeddingProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "invalid-config"
      | "request-timeout"
      | "request-failed"
      | "malformed-response"
      | "dimensions-mismatch"
  ) {
    super(message);
    this.name = "HttpEmbeddingProviderError";
  }
}

export function createHttpEmbeddingProvider(options: HttpEmbeddingProviderOptions): EmbeddingProvider {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const path = options.path ?? DEFAULT_EMBEDDINGS_PATH;
  const requestFormat = options.requestFormat ?? "openai";
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    name: options.name,
    async embed(request) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(new URL(path, baseUrl), {
          method: "POST",
          headers: createHeaders(options.apiKey),
          body: JSON.stringify(createRequestBody(request, requestFormat)),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new HttpEmbeddingProviderError(`Embedding sidecar returned HTTP ${response.status}.`, "request-failed");
        }

        const payload = await response.json();
        const vector = extractEmbeddingVector(payload);
        if (vector.length !== request.dimensions) {
          throw new HttpEmbeddingProviderError(
            `Embedding sidecar returned ${vector.length} dimensions, expected ${request.dimensions}.`,
            "dimensions-mismatch"
          );
        }

        return {
          vector,
          provider: options.name,
          model: request.model,
          dimensions: request.dimensions,
        } satisfies EmbeddingProviderResult;
      } catch (error) {
        if (error instanceof HttpEmbeddingProviderError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new HttpEmbeddingProviderError("Embedding sidecar request timed out.", "request-timeout");
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function createHttpEmbeddingProviderFromConfig(
  config: HttpEmbeddingProviderConfig,
  options: Omit<HttpEmbeddingProviderOptions, "name" | "baseUrl" | "apiKey"> = {}
): EmbeddingProvider {
  if (!config.baseUrl) {
    throw new HttpEmbeddingProviderError("Embedding provider config baseUrl is required.", "invalid-config");
  }
  return createHttpEmbeddingProvider({
    ...options,
    name: config.provider,
    baseUrl: config.baseUrl,
    apiKey: config.noKeyMode ? undefined : config.apiKey ?? undefined,
  });
}

function normalizeBaseUrl(baseUrl: string): URL {
  if (!baseUrl.trim()) {
    throw new HttpEmbeddingProviderError("Embedding sidecar baseUrl is required.", "invalid-config");
  }
  return new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

function createHeaders(apiKey: string | undefined): Record<string, string> {
  return {
    "content-type": "application/json",
    ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
  };
}

function createRequestBody(request: EmbeddingProviderRequest, requestFormat: "openai" | "tei") {
  if (requestFormat === "tei") {
    return { inputs: request.input };
  }
  return { model: request.model, input: request.input };
}

function extractEmbeddingVector(payload: unknown): number[] {
  const vector =
    extractOpenAiEmbedding(payload) ??
    extractEmbeddingsArray(payload) ??
    extractTeiArray(payload);

  if (!vector || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) {
    throw new HttpEmbeddingProviderError("Embedding sidecar response did not contain a finite numeric vector.", "malformed-response");
  }

  return vector;
}

function extractOpenAiEmbedding(payload: unknown): number[] | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.data)) return undefined;
  const first = payload.data[0];
  if (!isRecord(first) || !Array.isArray(first.embedding)) return undefined;
  return first.embedding;
}

function extractEmbeddingsArray(payload: unknown): number[] | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.embeddings)) return undefined;
  const first = payload.embeddings[0];
  return Array.isArray(first) ? first : undefined;
}

function extractTeiArray(payload: unknown): number[] | undefined {
  if (!Array.isArray(payload)) return undefined;
  const first = payload[0];
  return Array.isArray(first) ? first : payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
