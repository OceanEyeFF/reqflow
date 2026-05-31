#!/usr/bin/env node

const baseUrl = process.env.LOCAL_EMBEDDING_BASE_URL ?? "http://127.0.0.1:8081";
const path = process.env.LOCAL_EMBEDDING_PATH ?? "/embed";
const requestFormat = process.env.LOCAL_EMBEDDING_REQUEST_FORMAT ?? "tei";
const model = process.env.LOCAL_EMBEDDING_MODEL ?? "intfloat/multilingual-e5-large";
const dimensions = Number(process.env.LOCAL_EMBEDDING_DIMENSIONS ?? "1024");
const iterations = Number(process.env.LOCAL_EMBEDDING_ITERATIONS ?? "3");
const timeoutMs = Number(process.env.LOCAL_EMBEDDING_TIMEOUT_MS ?? "30000");
const input = process.env.LOCAL_EMBEDDING_INPUT ?? "请检索审批流程和报销规则的适用条件。";

if (!Number.isInteger(dimensions) || dimensions <= 0) {
  throw new Error(`LOCAL_EMBEDDING_DIMENSIONS must be a positive integer. Received: ${process.env.LOCAL_EMBEDDING_DIMENSIONS}`);
}
if (!Number.isInteger(iterations) || iterations <= 0) {
  throw new Error(`LOCAL_EMBEDDING_ITERATIONS must be a positive integer. Received: ${process.env.LOCAL_EMBEDDING_ITERATIONS}`);
}

const endpoint = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
const samples = [];

for (let index = 0; index < iterations; index += 1) {
  const started = performance.now();
  const vector = await embedOnce(endpoint, { input, model, dimensions, requestFormat, timeoutMs });
  samples.push(performance.now() - started);
  if (vector.length !== dimensions) {
    throw new Error(`Embedding sidecar returned ${vector.length} dimensions, expected ${dimensions}.`);
  }
  if (vector.some((value) => !Number.isFinite(value))) {
    throw new Error("Embedding sidecar returned a non-finite vector value.");
  }
}

samples.sort((a, b) => a - b);
const summary = {
  endpoint: endpoint.toString(),
  requestFormat,
  model,
  dimensions,
  iterations,
  latencyMs: {
    min: round(samples[0]),
    p50: round(percentile(samples, 0.5)),
    p95: round(percentile(samples, 0.95)),
    max: round(samples[samples.length - 1]),
  },
};

console.log(JSON.stringify(summary, null, 2));

async function embedOnce(endpoint, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createBody(options)),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Embedding sidecar returned HTTP ${response.status}.`);
    }
    const payload = await response.json();
    return extractVector(payload);
  } finally {
    clearTimeout(timeout);
  }
}

function createBody(options) {
  if (options.requestFormat === "openai") {
    return { model: options.model, input: options.input };
  }
  return { inputs: options.input };
}

function extractVector(payload) {
  if (Array.isArray(payload)) {
    return Array.isArray(payload[0]) ? payload[0] : payload;
  }
  if (payload && Array.isArray(payload.data) && payload.data[0] && Array.isArray(payload.data[0].embedding)) {
    return payload.data[0].embedding;
  }
  if (payload && Array.isArray(payload.embeddings) && Array.isArray(payload.embeddings[0])) {
    return payload.embeddings[0];
  }
  throw new Error("Embedding sidecar response did not contain a supported vector shape.");
}

function percentile(values, p) {
  if (values.length === 1) return values[0];
  const index = (values.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return values[lower];
  return values[lower] + (values[upper] - values[lower]) * (index - lower);
}

function round(value) {
  return Math.round(value * 100) / 100;
}
