import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const image = process.env.PG_TEXTSEARCH_IMAGE || "postgres:18";
const hostPort = process.env.PG_TEXTSEARCH_PORT || "55441";
const containerName =
  process.env.PG_TEXTSEARCH_CONTAINER_NAME || `reqflow-ms14-pg-textsearch-${process.pid}-${Date.now()}`;
const outputPath = process.env.PG_TEXTSEARCH_RESULT_PATH || "docs/ms14-pg-textsearch-compat-results.json";
const dbName = "reqflow_ms14";
const dbUser = "reqflow";
const dbPassword = "reqflow";
const startedContainer = { value: false };

try {
  runDocker(["--version"]);
  startContainer();
  waitForPostgres();
  const result = runProbe();
  writeJson(outputPath, result);
  console.log(`pg_textsearch compatibility result written: ${outputPath}`);
} catch (error) {
  writeJson(outputPath, buildFailureResult(error));
  console.error(`pg_textsearch compatibility PoC failed; result written: ${outputPath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (startedContainer.value && process.env.PG_TEXTSEARCH_KEEP_CONTAINER !== "true") {
    runDocker(["rm", "-f", containerName], { allowFailure: true });
  }
}

function startContainer() {
  runDocker([
    "run",
    "-d",
    "--name",
    containerName,
    "--label",
    "reqflow.ms14=pg-textsearch-compat-poc",
    "-e",
    `POSTGRES_USER=${dbUser}`,
    "-e",
    `POSTGRES_PASSWORD=${dbPassword}`,
    "-e",
    `POSTGRES_DB=${dbName}`,
    "-p",
    `127.0.0.1:${hostPort}:5432`,
    image
  ]);
  startedContainer.value = true;
}

function waitForPostgres() {
  const startedAt = Date.now();
  let lastOutput = "";
  while (Date.now() - startedAt < 90_000) {
    const result = spawnSync("docker", ["exec", containerName, "pg_isready", "-U", dbUser, "-d", "postgres"], {
      encoding: "utf8"
    });
    lastOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (result.status === 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new Error(`PostgreSQL container did not become ready within 90s. Last pg_isready output: ${lastOutput}`);
}

function runProbe() {
  execSql("CREATE DATABASE reqflow_ms14;", { database: "postgres", allowFailure: true });
  const postgresVersion = queryScalar("SHOW server_version");
  const sharedPreloadLibraries = queryScalar("SHOW shared_preload_libraries");
  const availableExtensions = queryRows(
    "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name IN ('pg_textsearch', 'vector') ORDER BY name"
  );
  const pgTextsearch = availableExtensions.find((extension) => extension.name === "pg_textsearch");
  let createExtension = {
    attempted: false,
    passed: false,
    reason: "pg_textsearch is not listed in pg_available_extensions for this image."
  };
  if (pgTextsearch) {
    createExtension = tryCreatePgTextsearch();
  }
  return {
    candidateId: "pg_textsearch",
    image,
    postgresVersion,
    sharedPreloadLibraries,
    availableExtensions,
    createExtension,
    decision: pgTextsearch ? "defer" : "defer",
    reason: pgTextsearch
      ? "Extension appears available but requires further preload/index/query validation outside this lightweight probe."
      : "No ready-to-run pg_textsearch runtime path is available from the tested PostgreSQL 18 image; a custom image/package install would be required.",
    policyEvidence: {
      isolatedRuntime: true,
      defaultRuntimeMutated: false,
      destructiveActions: false,
      notes: `Temporary Docker container ${containerName} on 127.0.0.1:${hostPort}; no host volume mounted.`
    }
  };
}

function tryCreatePgTextsearch() {
  const result = spawnSync(
    "docker",
    ["exec", "-i", containerName, "psql", "-v", "ON_ERROR_STOP=1", "-U", dbUser, "-d", options.database || dbName, "-X", "-A", "-t"],
    {
      input: "CREATE EXTENSION IF NOT EXISTS pg_textsearch;",
      encoding: "utf8"
    }
  );
  return {
    attempted: true,
    passed: result.status === 0,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim()
  };
}

function queryScalar(sql) {
  return execSql(sql, { trim: true });
}

function queryRows(sql) {
  const json = execSql(`SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json) FROM (${sql}) q;`, { trim: true });
  return JSON.parse(json);
}

function execSql(sql, options = {}) {
  const result = spawnSync(
    "docker",
    ["exec", "-i", containerName, "psql", "-v", "ON_ERROR_STOP=1", "-U", dbUser, "-d", dbName, "-X", "-A", "-t"],
    {
      input: sql,
      encoding: "utf8"
    }
  );
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`psql failed for SQL:\n${sql}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
  const output = result.stdout ?? "";
  return options.trim ? output.trim() : output;
}

function runDocker(args, options = {}) {
  try {
    return execFileSync("docker", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: options.capture ? "pipe" : "inherit"
    });
  } catch (error) {
    if (options.allowFailure) return "";
    throw error;
  }
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildFailureResult(error) {
  return {
    candidateId: "pg_textsearch",
    image,
    decision: "defer",
    failure: error instanceof Error ? error.message : String(error),
    policyEvidence: {
      isolatedRuntime: true,
      defaultRuntimeMutated: false,
      destructiveActions: false,
      notes: `Failure occurred in temporary container path ${containerName}; default runtime was not touched.`
    }
  };
}
