#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const databaseUrl =
  process.env.RUNTIME_DATABASE_URL ||
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_URL ||
  defaultDatabaseUrl();
const webUrl = process.env.RUNTIME_WEB_URL || "http://127.0.0.1:3000/login";
const shouldSeed = parseBoolean(process.env.RUNTIME_RUN_SEED);
const shouldProbeEmbedding = parseBoolean(process.env.RUNTIME_PROBE_EMBEDDING);

setEnvDefault("DATABASE_URL", databaseUrl);
setEnvDefault("POSTGRES_DATABASE_URL", databaseUrl);
setEnvDefault("SEARCH_EXTENSION_DATABASE_URL", databaseUrl);
setEnvDefault("POSTGRES_HOST", process.env.RUNTIME_POSTGRES_HOST || "127.0.0.1");
setEnvDefault("POSTGRES_PORT", process.env.RUNTIME_POSTGRES_PORT || "5432");

if (!isPostgresUrl(databaseUrl)) {
  fail("Runtime smoke requires a PostgreSQL DATABASE_URL.");
}

console.log("ReqFlow runtime bundle smoke");
console.log(`database: ${redactUrl(databaseUrl)}`);
console.log(`web_url: ${webUrl}`);
console.log(`run_seed: ${shouldSeed}`);
console.log(`probe_embedding: ${shouldProbeEmbedding}`);

run("wait for PostgreSQL TCP", "npm", ["run", "postgres:wait"]);
run("prisma migrate deploy", "npx", ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]);

if (shouldSeed) {
  run("seed database", "npm", ["run", "db:seed"]);
} else {
  console.log("\n> seed database");
  console.log("skipped; set RUNTIME_RUN_SEED=true to run seed");
}

run("PostgreSQL readiness", "npm", ["run", "postgres:readiness"]);
run("search extension readiness", "npm", ["run", "search:extensions"]);
await httpSmoke(webUrl);

if (shouldProbeEmbedding) {
  run("embedding sidecar probe", "npm", ["run", "embedding:probe"]);
} else {
  console.log("\n> embedding sidecar probe");
  console.log("skipped; set RUNTIME_PROBE_EMBEDDING=true to run the optional sidecar probe");
}

console.log("\nruntime bundle smoke: pass");

function run(label, command, args) {
  console.log(`\n> ${label}`);
  execFileSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function httpSmoke(rawUrl) {
  console.log("\n> web HTTP smoke");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.RUNTIME_HTTP_TIMEOUT_MS || "10000"));
  try {
    const response = await fetch(rawUrl, { redirect: "manual", signal: controller.signal });
    console.log(`status: ${response.status}`);
    if (response.status < 200 || response.status >= 400) {
      fail(`Expected HTTP 2xx/3xx from ${rawUrl}; received ${response.status}.`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

function defaultDatabaseUrl() {
  const host = process.env.RUNTIME_POSTGRES_HOST || "127.0.0.1";
  const port = process.env.RUNTIME_POSTGRES_PORT || "5432";
  const db = process.env.POSTGRES_DB || "reqflow_dev";
  const user = process.env.POSTGRES_USER || "reqflow";
  const password = process.env.POSTGRES_PASSWORD || "reqflow";
  return `postgresql://${user}:${password}@${host}:${port}/${db}?schema=public`;
}

function setEnvDefault(name, value) {
  if (!process.env[name]) {
    process.env[name] = value;
  }
}

function parseBoolean(value) {
  return value === "1" || value === "true" || value === "yes";
}

function isPostgresUrl(value) {
  return value.startsWith("postgresql://") || value.startsWith("postgres://");
}

function redactUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.password) url.password = "***";
  return url.toString();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
