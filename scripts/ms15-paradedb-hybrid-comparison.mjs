import { readFileSync, writeFileSync } from "node:fs";

const corpusPath = process.env.BM25_CORPUS_PATH || "docs/ms14-bm25-benchmark-corpus.json";
const baselinePath = process.env.BM25_BASELINE_RESULT_PATH || "docs/ms14-bm25-benchmark-baseline-results.json";
const paradedbPath = process.env.PARADEDB_CANDIDATE_RESULT_PATH || "docs/ms15-paradedb-candidate-benchmark-results.json";
const retrievalPath = process.env.RETRIEVAL_RESULT_PATH || "docs/retrieval-evaluation-ms10-results.json";
const outputPath = process.env.MS15_HYBRID_COMPARISON_RESULT_PATH || "docs/ms15-paradedb-hybrid-comparison-results.json";

const corpus = readJson(corpusPath);
const baseline = readJson(baselinePath);
const paradedb = readJson(paradedbPath);
const retrieval = readJson(retrievalPath);

const casesById = new Map(corpus.cases.map((testCase) => [testCase.id, testCase]));
const baselineMetrics = deriveCandidateMetrics(casesById, baseline);
const paradedbMetrics = deriveCandidateMetrics(casesById, paradedb);
const hybridInvariant = summarizeHybridInvariant(retrieval);

const comparison = {
  metadata: {
    milestone: "MS-15",
    worktrack: "WT-20260601-126",
    generatedAt: "2026-06-01",
    corpus: corpusPath,
    comparisonMode: "same-corpus lexical lanes plus separate hybrid invariant evidence"
  },
  inputs: {
    nativeFtsFixture: {
      path: baselinePath,
      candidateId: baseline.run.candidateId,
      measurementMode: baseline.run.measurementMode,
      sameCorpus: true
    },
    paradedbCandidate: {
      path: paradedbPath,
      candidateId: paradedb.run.candidateId,
      measurementMode: paradedb.run.measurementMode,
      sameCorpus: true
    },
    existingHybridRetrieval: {
      path: retrievalPath,
      sameCorpus: false,
      purpose: "RRF/no-raw-score-addition invariant evidence, not same-corpus BM25 performance"
    }
  },
  lexicalLaneComparison: {
    nativeFtsFixture: baselineMetrics,
    paradedbCandidate: paradedbMetrics,
    interpretation: [
      "Native FTS fixture is a schema fixture and should not be treated as measured runtime latency.",
      "ParadeDB candidate is measured on the MS-15 compose runtime and passes the same BM25 corpus gate.",
      "Raw scores are not comparable across engines; metrics are derived only from ranks."
    ]
  },
  hybridInvariant,
  decisionBoundary: {
    defaultRuntimeMutated: false,
    bm25ActiveInDefaultRuntime: false,
    rawScoreFusionAllowed: false,
    sameCorpusHybridPerformanceMeasured: false,
    notes: "WT-126 does not implement ParadeDB in the app retrieval path; WT-127 must preserve fdch0 approval boundary for any default runtime switch."
  }
};

writeFileSync(outputPath, `${JSON.stringify(comparison, null, 2)}\n`, "utf8");
console.log(`MS-15 ParadeDB hybrid comparison written: ${outputPath}`);
console.log(`ParadeDB avg Recall@5: ${paradedbMetrics.summary.avgRecallAt5.toFixed(4)}`);
console.log(`ParadeDB avg p50: ${paradedbMetrics.summary.avgP50Ms.toFixed(3)}ms`);
console.log(`Hybrid RRF invariant: ${hybridInvariant.rawScoreAddition === false ? "pass" : "fail"}`);

function deriveCandidateMetrics(casesByIdValue, results) {
  const caseMetrics = results.results.map((result) => {
    const testCase = casesByIdValue.get(result.caseId);
    if (!testCase) throw new Error(`Unknown result case id: ${result.caseId}`);
    const snippetIds = result.topK.map((hit) => hit.snippetId);
    const sourceIds = result.topK.map((hit) => hit.sourceId);
    const recallAt5 = ratioPresent(testCase.expectedSnippetIds, snippetIds.slice(0, 5));
    const recallAt10 = ratioPresent(testCase.expectedSnippetIds, snippetIds.slice(0, 10));
    const precisionAt5 = precisionPresent(testCase.expectedSnippetIds, snippetIds.slice(0, 5));
    const firstRelevantRank = firstRelevant(testCase.expectedSnippetIds, result.topK);
    return {
      caseId: result.caseId,
      recallAt5,
      recallAt10,
      precisionAt5,
      firstRelevantRank,
      top1SnippetId: result.topK[0]?.snippetId ?? "none",
      forbiddenReturned: testCase.forbiddenSourceIds.some((id) => sourceIds.includes(id)),
      p50Ms: result.queryPerformance.p50Ms,
      p95Ms: result.queryPerformance.p95Ms,
      explainAvailable: result.explain.available,
      tokenizer: result.tokenizerEvidence.tokenizer,
      segmentationMode: result.tokenizerEvidence.segmentationMode
    };
  });
  return {
    run: {
      candidateId: results.run.candidateId,
      engine: results.run.engine,
      measurementMode: results.run.measurementMode,
      postgresVersion: results.run.postgresVersion,
      runtimeImage: results.run.runtimeImage,
      indexPerformance: results.run.indexPerformance
    },
    summary: {
      avgRecallAt5: avg(caseMetrics.map((item) => item.recallAt5)),
      avgRecallAt10: avg(caseMetrics.map((item) => item.recallAt10)),
      avgPrecisionAt5: avg(caseMetrics.map((item) => item.precisionAt5)),
      avgFirstRelevantRank: avg(caseMetrics.map((item) => item.firstRelevantRank)),
      avgP50Ms: avg(caseMetrics.map((item) => item.p50Ms)),
      avgP95Ms: avg(caseMetrics.map((item) => item.p95Ms)),
      explainCoverage: ratioPresent(caseMetrics.map((item) => item.caseId), caseMetrics.filter((item) => item.explainAvailable).map((item) => item.caseId)),
      forbiddenReturnedCases: caseMetrics.filter((item) => item.forbiddenReturned).map((item) => item.caseId)
    },
    cases: caseMetrics
  };
}

function summarizeHybridInvariant(results) {
  const modes = new Set();
  const vectorLaneStatuses = new Set();
  const vectorFailureReasons = new Set();
  let rawScoreAddition = false;
  let maxFusedHits = 0;
  for (const result of results.results) {
    modes.add(result.retrievalMode);
    rawScoreAddition = rawScoreAddition || result.debugEvidence.rawScoreAddition;
    maxFusedHits = Math.max(maxFusedHits, result.debugEvidence.fusedHits.length);
    vectorLaneStatuses.add(result.debugEvidence.vectorLane.status);
    if (result.debugEvidence.vectorLane.reason) {
      vectorFailureReasons.add(result.debugEvidence.vectorLane.reason);
    }
  }
  return {
    source: retrievalPath,
    sameCorpus: false,
    modes: [...modes].sort(),
    rawScoreAddition,
    maxFusedHits,
    vectorLaneStatuses: [...vectorLaneStatuses].sort(),
    vectorFailureReasons: [...vectorFailureReasons].sort(),
    requiredInvariant: "Future ParadeDB lexical lane integration must use RRF-style rank fusion and preserve no raw score addition.",
    interpretation: "Existing MS-10 evidence validates hybrid retrieval behavior and failure handling, but it is not same-corpus MS-15 performance evidence."
  };
}

function ratioPresent(expectedIds, returnedIds) {
  const returned = new Set(returnedIds);
  return expectedIds.filter((id) => returned.has(id)).length / expectedIds.length;
}

function precisionPresent(expectedIds, returnedIds) {
  const expected = new Set(expectedIds);
  return returnedIds.filter((id) => expected.has(id)).length / 5;
}

function firstRelevant(expectedIds, hits) {
  const expected = new Set(expectedIds);
  for (const hit of hits) {
    if (expected.has(hit.snippetId)) return hit.rank;
  }
  return Number.POSITIVE_INFINITY;
}

function avg(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
