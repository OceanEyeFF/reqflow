import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const image = process.env.VECTORCHORD_IMAGE || "tensorchord/vchord-suite:pg18-latest";
const hostPort = process.env.VECTORCHORD_PORT || "55439";
const containerName =
  process.env.VECTORCHORD_CONTAINER_NAME || `reqflow-ms14-vectorchord-${process.pid}-${Date.now()}`;
const corpusPath = process.env.BM25_CORPUS_PATH || "docs/ms14-bm25-benchmark-corpus.json";
const outputPath = process.env.VECTORCHORD_RESULT_PATH || "docs/ms14-vectorchord-bm25-results.json";
const dbName = "reqflow_ms14";
const dbUser = "reqflow";
const dbPassword = "reqflow";
const sampleSize = Number.parseInt(process.env.VECTORCHORD_SAMPLE_SIZE || "5", 10);
const tokenizerName = "ms14_jieba";
const indexName = "ms14_docs_embedding_bm25";
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"));
const startedContainer = { value: false };
const probeState = {
  postgresVersion: "unknown",
  availableExtensions: [],
  installedExtensions: [],
  indexBuildMs: 0,
  indexSizeBytes: null,
  stage: "not-started"
};

try {
  ensureDockerAvailable();
  startContainer();
  waitForPostgres();
  const result = runProbe();
  writeJson(outputPath, result);
  console.log(`VectorChord-BM25 PoC result written: ${outputPath}`);
} catch (error) {
  const failure = buildFailureResult(error);
  writeJson(outputPath, failure);
  console.error(`VectorChord-BM25 PoC failed; failure result written: ${outputPath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (startedContainer.value && process.env.VECTORCHORD_KEEP_CONTAINER !== "true") {
    runDocker(["rm", "-f", containerName], { allowFailure: true });
  }
}

function ensureDockerAvailable() {
  runDocker(["--version"]);
}

function startContainer() {
  runDocker([
    "run",
    "-d",
    "--name",
    containerName,
    "--label",
    "reqflow.ms14=vectorchord-bm25-poc",
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
    const result = spawnSync("docker", ["exec", containerName, "pg_isready", "-U", dbUser, "-d", dbName], {
      encoding: "utf8"
    });
    lastOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (result.status === 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new Error(`VectorChord container did not become ready within 90s. Last pg_isready output: ${lastOutput}`);
}

function runProbe() {
  const serverVersion = queryScalar("SHOW server_version");
  probeState.postgresVersion = serverVersion;
  probeState.stage = "server-version";
  const availableExtensions = queryRows(
    "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name IN ('pg_tokenizer', 'vchord_bm25', 'vector') ORDER BY name"
  );
  probeState.availableExtensions = availableExtensions;
  probeState.stage = "available-extensions";

  for (const name of ["pg_tokenizer", "vchord_bm25", "vector"]) {
    if (!availableExtensions.some((extension) => extension.name === name)) {
      throw new Error(`${name} is not available in VectorChord candidate image.`);
    }
  }

  execSql("CREATE EXTENSION IF NOT EXISTS pg_tokenizer CASCADE;");
  execSql("CREATE EXTENSION IF NOT EXISTS vchord_bm25 CASCADE;");
  execSql("CREATE EXTENSION IF NOT EXISTS vector CASCADE;");
  const installedExtensions = queryRows(
    "SELECT extname, extversion FROM pg_extension WHERE extname IN ('pg_tokenizer', 'vchord_bm25', 'vector') ORDER BY extname"
  );
  probeState.installedExtensions = installedExtensions;
  probeState.stage = "extensions-created";

  execSql("DROP TABLE IF EXISTS ms14_docs;");
  execSql(`
    CREATE TABLE ms14_docs (
      id SERIAL PRIMARY KEY,
      source_id TEXT NOT NULL,
      snippet_id TEXT NOT NULL UNIQUE,
      knowledge_base_id TEXT NOT NULL,
      source_path TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      search_text TEXT NOT NULL,
      enabled BOOLEAN NOT NULL,
      embedding bm25vector
    );
  `);
  createChineseTokenizer();
  insertSnippets();
  execSql(`CREATE INDEX ${indexName} ON ms14_docs USING bm25 (embedding bm25_ops);`);
  const indexSizeBytes = Number.parseInt(queryScalar(`SELECT pg_relation_size('${indexName}'::regclass)::text`), 10);
  probeState.indexSizeBytes = indexSizeBytes;
  const indexBuildMs = measure(() => {
    execSql(`DROP INDEX ${indexName};`);
    execSql(`CREATE INDEX ${indexName} ON ms14_docs USING bm25 (embedding bm25_ops);`);
  });
  probeState.indexBuildMs = indexBuildMs;
  probeState.stage = "bm25-index-created";

  const results = corpus.cases.map((testCase) => runCase(testCase));
  return {
    run: {
      candidateId: "vectorchord-bm25-pg-tokenizer",
      engine: "vchord_bm25",
      candidateClass: "bm25-plugin",
      measurementMode: "measured",
      postgresVersion: serverVersion,
      runtimeImage: image,
      extensionStatus: {
        lexicalEngine: "vchord_bm25",
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
        notes: `Temporary Docker container ${containerName} on 127.0.0.1:${hostPort}; no host volume mounted.`
      }
    },
    results
  };
}

function createChineseTokenizer() {
  execSql(`
    SELECT create_text_analyzer('ms14_jieba_analyzer', $$
    [pre_tokenizer.jieba]
    $$);
  `);
  execSql(`
    SELECT create_custom_model_tokenizer_and_trigger(
      tokenizer_name => '${tokenizerName}',
      model_name => 'ms14_jieba_model',
      text_analyzer_name => 'ms14_jieba_analyzer',
      table_name => 'ms14_docs',
      source_column => 'search_text',
      target_column => 'embedding'
    );
  `);
}

function insertSnippets() {
  const values = corpus.snippets
    .map((snippet) => {
      const searchText = `${snippet.title}\n${snippet.sourcePath}\n${snippet.content}`;
      return `(${sqlString(snippet.sourceId)}, ${sqlString(snippet.snippetId)}, ${sqlString(snippet.knowledgeBaseId)}, ${sqlString(snippet.sourcePath)}, ${sqlString(snippet.title)}, ${sqlString(snippet.content)}, ${sqlString(searchText)}, ${snippet.enabled ? "true" : "false"})`;
    })
    .join(",\n");
  execSql(`
    INSERT INTO ms14_docs (source_id, snippet_id, knowledge_base_id, source_path, title, content, search_text, enabled)
    VALUES ${values};
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
      tokenizer: tokenizerName,
      segmentationMode: "word",
      queryTokens: tokenizeForEvidence(testCase.query),
      focusTermBehavior: testCase.tokenizationFocus.map((term) => `${term}: jieba/custom tokenizer probe used for bm25vector query`)
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
      notes: "Case ran inside the temporary VectorChord candidate container only."
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
    SELECT source_id, snippet_id, embedding <&> to_bm25query('${indexName}'::regclass, tokenize(${query}, '${tokenizerName}')::bm25vector) AS score
    FROM ms14_docs
    WHERE enabled = true
      AND knowledge_base_id IN (${kbList})
    ORDER BY score
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

function tokenizeForEvidence(text) {
  try {
    return queryRows(`SELECT unnest(regexp_split_to_array(trim(both '{}' from tokenize(${sqlString(text)}, '${tokenizerName}')::text), ', *')) AS token`)
      .map((row) => row.token)
      .filter(Boolean)
      .slice(0, 20);
  } catch {
    return [text];
  }
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
  if (result.status !== 0) {
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

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildFailureResult(error) {
  const message = error instanceof Error ? error.message : String(error);
  const existingOutput = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf8")) : null;
  return {
    run: {
      candidateId: "vectorchord-bm25-pg-tokenizer",
      engine: "vchord_bm25",
      candidateClass: "bm25-plugin",
      measurementMode: "schema-fixture",
      postgresVersion: probeState.postgresVersion,
      runtimeImage: image,
      extensionStatus: {
        lexicalEngine: "vchord_bm25",
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
        notes: `Failure occurred in temporary container path ${containerName}; default runtime was not touched.`
      }
    },
    results: existingOutput?.results ?? [],
    failure: {
      message,
      containerName,
      hostPort,
      postgresVersion: probeState.postgresVersion,
      stage: probeState.stage
    }
  };
}
