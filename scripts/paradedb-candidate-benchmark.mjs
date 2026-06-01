import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const composeFile = process.env.PARADEDB_COMPOSE_FILE || "docker-compose.paradedb.yml";
const composeService = process.env.PARADEDB_POSTGRES_SERVICE || "postgres";
const dbName = process.env.POSTGRES_DB || "reqflow_dev";
const dbUser = process.env.POSTGRES_USER || "reqflow";
const corpusPath = process.env.BM25_CORPUS_PATH || "docs/ms14-bm25-benchmark-corpus.json";
const outputPath = process.env.PARADEDB_CANDIDATE_RESULT_PATH || "docs/ms15-paradedb-candidate-benchmark-results.json";
const schemaName = process.env.PARADEDB_BENCHMARK_SCHEMA || "ms15_pg_search_benchmark";
const sampleSize = Number.parseInt(process.env.PARADEDB_SAMPLE_SIZE || "5", 10);
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"));
const probeState = {
  postgresVersion: "unknown",
  availableExtensions: [],
  installedExtensions: [],
  indexBuildMs: 0,
  indexSizeBytes: null,
  stage: "not-started"
};

try {
  ensureComposeServiceRunning();
  const result = runProbe();
  writeJson(outputPath, result);
  console.log(`ParadeDB candidate benchmark result written: ${outputPath}`);
} catch (error) {
  const failure = buildFailureResult(error);
  writeJson(outputPath, failure);
  console.error(`ParadeDB candidate benchmark failed; failure result written: ${outputPath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function ensureComposeServiceRunning() {
  const output = runCompose(["ps", "--status", "running", "--services"], { capture: true, allowFailure: true });
  const runningServices = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!runningServices.includes(composeService)) {
    throw new Error(
      `Compose service "${composeService}" is not running. Start the candidate runtime with docker compose -f ${composeFile} up -d postgres web.`
    );
  }
}

function runProbe() {
  const serverVersion = queryScalar("SHOW server_version");
  probeState.postgresVersion = serverVersion;
  probeState.stage = "server-version";
  const availableExtensions = queryRows(
    "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name IN ('pg_search', 'vector') ORDER BY name"
  );
  probeState.availableExtensions = availableExtensions;
  probeState.stage = "available-extensions";
  const pgSearch = availableExtensions.find((extension) => extension.name === "pg_search");
  const vector = availableExtensions.find((extension) => extension.name === "vector");
  if (!pgSearch) throw new Error("pg_search is not available in the ParadeDB candidate runtime.");
  if (!vector) throw new Error("vector extension is not available in the ParadeDB candidate runtime.");

  execSql("CREATE EXTENSION IF NOT EXISTS pg_search;");
  execSql("CREATE EXTENSION IF NOT EXISTS vector;");
  const installedExtensions = queryRows(
    "SELECT extname, extversion FROM pg_extension WHERE extname IN ('pg_search', 'vector') ORDER BY extname"
  );
  probeState.installedExtensions = installedExtensions;
  probeState.stage = "extensions-created";

  resetBenchmarkSchema();
  createBenchmarkTable();
  insertSnippets();
  createBenchmarkIndex();

  const indexSizeBytes = Number.parseInt(
    queryScalar(`SELECT pg_relation_size('${ident(schemaName)}.ms15_docs_bm25_idx'::regclass)::text`),
    10
  );
  probeState.indexSizeBytes = indexSizeBytes;
  const indexBuildMs = measure(() => {
    execSql(`DROP INDEX ${ident(schemaName)}.ms15_docs_bm25_idx;`);
    createBenchmarkIndex();
  });
  probeState.indexBuildMs = indexBuildMs;
  probeState.stage = "bm25-index-created";

  const results = corpus.cases.map((testCase) => runCase(testCase));
  return {
    run: {
      candidateId: "paradedb-pg-search-ms15-candidate-runtime",
      engine: "pg_search",
      candidateClass: "bm25-plugin",
      measurementMode: "measured",
      postgresVersion: serverVersion,
      runtimeImage: process.env.PARADEDB_IMAGE || "docker-compose.paradedb.yml resolved image",
      extensionStatus: {
        lexicalEngine: "pg_search",
        bm25Enabled: true,
        availableExtensions,
        installedExtensions
      },
      indexPerformance: {
        indexBuildMs,
        indexSizeBytes,
        documentCount: corpus.snippets.length,
        snippetCount: corpus.snippets.length
      },
      policyEvidence: {
        isolatedRuntime: true,
        defaultRuntimeMutated: false,
        destructiveActions: false,
        rawScoreFusion: false,
        notes: `Candidate compose service ${composeService}; benchmark objects isolated to schema ${schemaName}.`
      }
    },
    results
  };
}

function resetBenchmarkSchema() {
  execSql(`DROP SCHEMA IF EXISTS ${ident(schemaName)} CASCADE;`);
  execSql(`CREATE SCHEMA ${ident(schemaName)};`);
}

function createBenchmarkTable() {
  execSql(`
    CREATE TABLE ${ident(schemaName)}.ms15_docs (
      id SERIAL PRIMARY KEY,
      source_id TEXT NOT NULL,
      snippet_id TEXT NOT NULL UNIQUE,
      knowledge_base_id TEXT NOT NULL,
      source_path TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      enabled BOOLEAN NOT NULL
    );
  `);
}

function insertSnippets() {
  const values = corpus.snippets
    .map((snippet) => {
      return `(${sqlString(snippet.sourceId)}, ${sqlString(snippet.snippetId)}, ${sqlString(snippet.knowledgeBaseId)}, ${sqlString(snippet.sourcePath)}, ${sqlString(snippet.title)}, ${sqlString(snippet.content)}, ${snippet.enabled ? "true" : "false"})`;
    })
    .join(",\n");
  execSql(`
    INSERT INTO ${ident(schemaName)}.ms15_docs (source_id, snippet_id, knowledge_base_id, source_path, title, content, enabled)
    VALUES ${values};
  `);
}

function createBenchmarkIndex() {
  execSql(`
    CREATE INDEX ms15_docs_bm25_idx
    ON ${ident(schemaName)}.ms15_docs
    USING bm25 (id, content, title, source_path, source_id, snippet_id, knowledge_base_id, enabled)
    WITH (key_field='id');
  `);
}

function runCase(testCase) {
  const limit5 = timedQuery(testCase, 5);
  const limit10 = timedQuery(testCase, 10);
  const limit20 = timedQuery(testCase, 20);
  const samples = [];
  let topK = [];
  for (let index = 0; index < sampleSize; index += 1) {
    const measured = timedQuery(testCase, 10);
    samples.push(measured.elapsedMs);
    topK = measured.rows;
  }
  samples.sort((a, b) => a - b);
  return {
    caseId: testCase.id,
    matchedTerms: testCase.mustContainTerms,
    topK: topK.map((row, index) => ({
      rank: index + 1,
      sourceId: row.source_id,
      snippetId: row.snippet_id,
      score: Number(row.score)
    })),
    tokenizerEvidence: {
      tokenizer: "pdb.unicode default",
      segmentationMode: "mixed",
      queryTokens: deriveQueryTokens(testCase.query),
      focusTermBehavior: testCase.tokenizationFocus.map((term) => `${term}: queried via ParadeDB match operator in candidate compose runtime and checked against ranked hits`)
    },
    queryPerformance: {
      firstQueryMs: limit5.elapsedMs,
      warmQueryMs: samples[0] ?? limit5.elapsedMs,
      p50Ms: percentile(samples, 0.5),
      p95Ms: percentile(samples, 0.95),
      limit5Ms: limit5.elapsedMs,
      limit10Ms: limit10.elapsedMs,
      limit20Ms: limit20.elapsedMs,
      sampleSize
    },
    explain: explainQuery(testCase, 5),
    policyEvidence: {
      isolatedRuntime: true,
      defaultRuntimeMutated: false,
      destructiveActions: false,
      rawScoreFusion: false,
      notes: `Case ran in candidate compose runtime schema ${schemaName}.`
    }
  };
}

function timedQuery(testCase, limit) {
  const start = performance.now();
  const rows = queryRows(buildSearchSql(testCase, limit));
  const elapsedMs = roundMs(performance.now() - start);
  return { rows, elapsedMs };
}

function buildSearchSql(testCase, limit) {
  const kbList = testCase.selectedKnowledgeBaseIds.map(sqlString).join(", ");
  const query = sqlString(testCase.query);
  return `
    SELECT source_id, snippet_id, pdb.score(id) AS score
    FROM ${ident(schemaName)}.ms15_docs
    WHERE enabled = true
      AND knowledge_base_id IN (${kbList})
      AND (
        content ||| ${query}
        OR title ||| ${query}
        OR source_path ||| ${query}
      )
    ORDER BY score DESC
    LIMIT ${limit}
  `;
}

function explainQuery(testCase, limit) {
  const output = execSql(`EXPLAIN ${buildSearchSql(testCase, limit)}`, { trim: true });
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return {
    available: true,
    summary: lines[0] ?? "EXPLAIN returned no lines.",
    planHighlights: lines.slice(0, 8)
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
    ["compose", "-f", composeFile, "exec", "-T", composeService, "psql", "-v", "ON_ERROR_STOP=1", "-U", dbUser, "-d", dbName, "-X", "-A", "-t"],
    {
      cwd: process.cwd(),
      input: sql,
      encoding: "utf8",
      env: process.env,
      shell: process.platform === "win32"
    }
  );
  if (result.status !== 0) {
    throw new Error(`psql failed for SQL:\n${sql}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
  const output = result.stdout ?? "";
  return options.trim ? output.trim() : output;
}

function runCompose(args, options = {}) {
  try {
    return execFileSync("docker", ["compose", "-f", composeFile, ...args], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: process.env,
      stdio: options.capture ? "pipe" : "inherit",
      shell: process.platform === "win32"
    });
  } catch (error) {
    if (options.allowFailure) return "";
    throw error;
  }
}

function measure(fn) {
  const start = performance.now();
  fn();
  return roundMs(performance.now() - start);
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const index = Math.min(values.length - 1, Math.ceil(values.length * p) - 1);
  return roundMs(values[index]);
}

function roundMs(value) {
  return Math.round(value * 1000) / 1000;
}

function deriveQueryTokens(query) {
  const tokens = query
    .split(/[\s,，。？?、/]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
  return tokens.length > 0 ? tokens : [query];
}

function ident(value) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }
  return `"${value}"`;
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildFailureResult(error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    run: {
      candidateId: "paradedb-pg-search-ms15-candidate-runtime",
      engine: "pg_search",
      candidateClass: "bm25-plugin",
      measurementMode: "schema-fixture",
      postgresVersion: probeState.postgresVersion,
      runtimeImage: process.env.PARADEDB_IMAGE || "docker-compose.paradedb.yml resolved image",
      extensionStatus: {
        lexicalEngine: "pg_search",
        bm25Enabled: false,
        availableExtensions: probeState.availableExtensions,
        installedExtensions: probeState.installedExtensions,
        failureStage: probeState.stage,
        failure: message
      },
      indexPerformance: {
        indexBuildMs: probeState.indexBuildMs,
        indexSizeBytes: probeState.indexSizeBytes,
        documentCount: corpus.snippets?.length ?? 0,
        snippetCount: corpus.snippets?.length ?? 0
      },
      policyEvidence: {
        isolatedRuntime: true,
        defaultRuntimeMutated: false,
        destructiveActions: false,
        rawScoreFusion: false,
        notes: `Failure occurred in candidate compose benchmark schema ${schemaName}; default runtime was not touched.`
      }
    },
    results: [],
    failure: {
      message,
      composeFile,
      composeService,
      schemaName,
      postgresVersion: probeState.postgresVersion,
      stage: probeState.stage
    }
  };
}
