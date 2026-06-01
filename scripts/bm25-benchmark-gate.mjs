import { readFileSync } from "node:fs";

const corpusPath = process.argv[2] || "docs/ms14-bm25-benchmark-corpus.json";
const resultsPath = process.argv[3];
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"));

validateCorpus(corpus);

if (resultsPath) {
  const results = JSON.parse(readFileSync(resultsPath, "utf8"));
  validateResults(corpus, results);
} else {
  console.log(`BM25 benchmark corpus gate passed: ${corpus.cases.length} cases, ${corpus.snippets.length} snippets validated.`);
}

function validateCorpus(value) {
  if (!Number.isInteger(value.version) || value.version < 1) {
    throw new Error("Corpus must include positive integer version.");
  }
  requireNonEmptyString(value.description, "corpus.description");
  requireStringArray(value.metricGoals, "corpus.metricGoals", 4);
  requireStringArray(value.policyBoundaries, "corpus.policyBoundaries", 3);

  if (!Array.isArray(value.snippets) || value.snippets.length < 10) {
    throw new Error("Corpus must include at least 10 snippets.");
  }
  if (!Array.isArray(value.cases) || value.cases.length < 6) {
    throw new Error("Corpus must include at least 6 benchmark cases.");
  }

  const snippetIds = new Set();
  const sourceIds = new Set();
  for (const snippet of value.snippets) validateSnippet(snippet, snippetIds, sourceIds);

  const seenCaseIds = new Set();
  const requiredTags = new Set([
    "pure-chinese",
    "mixed-cn-en",
    "business-terms",
    "source-path",
    "synonym",
    "negative-trap",
    "citation"
  ]);

  for (const testCase of value.cases) {
    validateCase(testCase, seenCaseIds, snippetIds, sourceIds);
    for (const tag of testCase.tags) requiredTags.delete(tag);
  }
  if (requiredTags.size > 0) {
    throw new Error(`Corpus is missing required tags: ${[...requiredTags].join(", ")}`);
  }
}

function validateSnippet(snippet, seenSnippetIds, seenSourceIds) {
  requireNonEmptyString(snippet.sourceId, "snippet.sourceId");
  requireNonEmptyString(snippet.snippetId, "snippet.snippetId");
  requireNonEmptyString(snippet.knowledgeBaseId, `${snippet.snippetId}.knowledgeBaseId`);
  requireNonEmptyString(snippet.sourcePath, `${snippet.snippetId}.sourcePath`);
  requireNonEmptyString(snippet.title, `${snippet.snippetId}.title`);
  requireNonEmptyString(snippet.content, `${snippet.snippetId}.content`);
  if (typeof snippet.enabled !== "boolean") {
    throw new Error(`${snippet.snippetId}.enabled must be boolean.`);
  }
  requireStringArray(snippet.domainTerms, `${snippet.snippetId}.domainTerms`, 2);

  if (seenSnippetIds.has(snippet.snippetId)) throw new Error(`Duplicate snippetId: ${snippet.snippetId}`);
  seenSnippetIds.add(snippet.snippetId);
  seenSourceIds.add(snippet.sourceId);
}

function validateCase(testCase, seenCaseIds, snippetIds, sourceIds) {
  requireNonEmptyString(testCase.id, "case.id");
  if (seenCaseIds.has(testCase.id)) throw new Error(`Duplicate case id: ${testCase.id}`);
  seenCaseIds.add(testCase.id);

  requireNonEmptyString(testCase.query, `${testCase.id}.query`);
  requireStringArray(testCase.selectedKnowledgeBaseIds, `${testCase.id}.selectedKnowledgeBaseIds`, 1);
  requireStringArray(testCase.expectedSourceIds, `${testCase.id}.expectedSourceIds`, 1);
  requireStringArray(testCase.expectedSnippetIds, `${testCase.id}.expectedSnippetIds`, 1);
  requireStringArray(testCase.mustContainTerms, `${testCase.id}.mustContainTerms`, 2);
  requireStringArray(testCase.tokenizationFocus, `${testCase.id}.tokenizationFocus`, 2);
  requireStringArray(testCase.forbiddenSourceIds, `${testCase.id}.forbiddenSourceIds`, 1);
  requireStringArray(testCase.tags, `${testCase.id}.tags`, 1);
  validateThreshold(testCase.minRecallAt5, `${testCase.id}.minRecallAt5`, 0.5, 1);
  validateThreshold(testCase.minRecallAt10, `${testCase.id}.minRecallAt10`, testCase.minRecallAt5, 1);
  validateThreshold(testCase.minPrecisionAt5, `${testCase.id}.minPrecisionAt5`, 0.2, 1);
  validateThreshold(testCase.maxFirstRelevantRank, `${testCase.id}.maxFirstRelevantRank`, 1, 10);

  for (const sourceId of testCase.expectedSourceIds.concat(testCase.forbiddenSourceIds)) {
    if (!sourceIds.has(sourceId)) throw new Error(`${testCase.id} references unknown sourceId: ${sourceId}`);
  }
  for (const snippetId of testCase.expectedSnippetIds) {
    if (!snippetIds.has(snippetId)) throw new Error(`${testCase.id} references unknown snippetId: ${snippetId}`);
  }
  if (testCase.expectedSourceIds.some((id) => testCase.forbiddenSourceIds.includes(id))) {
    throw new Error(`${testCase.id} has an expected source that is also forbidden.`);
  }
}

function validateResults(corpusValue, results) {
  validateRunMetadata(results.run);
  if (!Array.isArray(results.results)) {
    throw new Error("Results file must contain a results array.");
  }
  const casesById = new Map(corpusValue.cases.map((testCase) => [testCase.id, testCase]));
  const expectedCaseIds = new Set(casesById.keys());
  const observedCaseIds = new Set();

  for (const result of results.results) {
    requireNonEmptyString(result.caseId, "result.caseId");
    if (!expectedCaseIds.has(result.caseId)) throw new Error(`Unknown result case id: ${result.caseId}`);
    if (observedCaseIds.has(result.caseId)) throw new Error(`Duplicate result case id: ${result.caseId}`);
    observedCaseIds.add(result.caseId);
    validateCaseResult(casesById.get(result.caseId), result, results.run);
  }

  for (const caseId of expectedCaseIds) {
    if (!observedCaseIds.has(caseId)) throw new Error(`Missing result for case: ${caseId}`);
  }
  console.log(`BM25 benchmark result gate passed: ${results.run.candidateId} (${results.results.length} cases validated).`);
}

function validateRunMetadata(run) {
  if (!run || typeof run !== "object") throw new Error("run metadata is required.");
  requireNonEmptyString(run.candidateId, "run.candidateId");
  requireNonEmptyString(run.engine, "run.engine");
  if (!["bm25-plugin", "native-fts-baseline", "hybrid-baseline", "tokenizer-helper"].includes(run.candidateClass)) {
    throw new Error("run.candidateClass is invalid.");
  }
  if (!["measured", "schema-fixture"].includes(run.measurementMode)) {
    throw new Error("run.measurementMode must be measured or schema-fixture.");
  }
  requireNonEmptyString(run.postgresVersion, "run.postgresVersion");
  requireNonEmptyString(run.runtimeImage, "run.runtimeImage");
  if (!run.extensionStatus || typeof run.extensionStatus !== "object") {
    throw new Error("run.extensionStatus is required.");
  }
  requireNonEmptyString(run.extensionStatus.lexicalEngine, "run.extensionStatus.lexicalEngine");
  if (typeof run.extensionStatus.bm25Enabled !== "boolean") {
    throw new Error("run.extensionStatus.bm25Enabled must be boolean.");
  }
  if (run.candidateClass === "bm25-plugin" && run.extensionStatus.bm25Enabled !== true) {
    throw new Error("BM25 plugin candidates must report bm25Enabled=true.");
  }
  validateIndexPerformance(run.indexPerformance);
  validatePolicyEvidence(run.policyEvidence, "run.policyEvidence");
}

function validateCaseResult(testCase, result, run) {
  if (!Array.isArray(result.topK) || result.topK.length < 5 || result.topK.length > 10) {
    throw new Error(`${testCase.id}.topK must contain 5-10 ranked hits.`);
  }
  requireStringArray(result.matchedTerms, `${testCase.id}.matchedTerms`, testCase.mustContainTerms.length);
  validateTokenizerEvidence(testCase, result.tokenizerEvidence);
  validateQueryPerformance(result.queryPerformance, `${testCase.id}.queryPerformance`);
  validateExplainEvidence(result.explain, `${testCase.id}.explain`);
  validatePolicyEvidence(result.policyEvidence, `${testCase.id}.policyEvidence`);

  const seenRanks = new Set();
  const returnedSourceIds = [];
  const returnedSnippetIds = [];
  for (const hit of result.topK) {
    validateThreshold(hit.rank, `${testCase.id}.topK.rank`, 1, 10);
    if (seenRanks.has(hit.rank)) throw new Error(`${testCase.id}.topK has duplicate rank: ${hit.rank}`);
    seenRanks.add(hit.rank);
    requireNonEmptyString(hit.sourceId, `${testCase.id}.topK.sourceId`);
    requireNonEmptyString(hit.snippetId, `${testCase.id}.topK.snippetId`);
    returnedSourceIds.push(hit.sourceId);
    returnedSnippetIds.push(hit.snippetId);
    if (hit.score !== undefined && typeof hit.score !== "number") {
      throw new Error(`${testCase.id}.topK.score must be numeric when present.`);
    }
  }

  const recallAt5 = ratioPresent(testCase.expectedSnippetIds, returnedSnippetIds.slice(0, 5));
  const recallAt10 = ratioPresent(testCase.expectedSnippetIds, returnedSnippetIds.slice(0, 10));
  const precisionAt5 = precisionPresent(testCase.expectedSnippetIds, returnedSnippetIds.slice(0, 5));
  const firstRelevantRank = firstRelevant(testCase.expectedSnippetIds, result.topK);

  validateThreshold(recallAt5, `${testCase.id}.derivedRecallAt5`, testCase.minRecallAt5, 1);
  validateThreshold(recallAt10, `${testCase.id}.derivedRecallAt10`, testCase.minRecallAt10, 1);
  validateThreshold(precisionAt5, `${testCase.id}.derivedPrecisionAt5`, testCase.minPrecisionAt5, 1);
  validateThreshold(firstRelevantRank, `${testCase.id}.derivedFirstRelevantRank`, 1, testCase.maxFirstRelevantRank);

  for (const term of testCase.mustContainTerms) {
    if (!result.matchedTerms.includes(term)) {
      throw new Error(`${testCase.id} did not report required matched term: ${term}`);
    }
  }
  for (const forbidden of testCase.forbiddenSourceIds) {
    if (returnedSourceIds.includes(forbidden)) {
      throw new Error(`${testCase.id} returned forbidden source: ${forbidden}`);
    }
  }
  if (run.measurementMode === "measured" && result.queryPerformance.sampleSize < 3) {
    throw new Error(`${testCase.id}.queryPerformance.sampleSize must be at least 3 for measured runs.`);
  }
}

function validateTokenizerEvidence(testCase, evidence) {
  if (!evidence || typeof evidence !== "object") throw new Error(`${testCase.id}.tokenizerEvidence is required.`);
  requireNonEmptyString(evidence.tokenizer, `${testCase.id}.tokenizerEvidence.tokenizer`);
  requireStringArray(evidence.queryTokens, `${testCase.id}.tokenizerEvidence.queryTokens`, 1);
  requireStringArray(evidence.focusTermBehavior, `${testCase.id}.tokenizerEvidence.focusTermBehavior`, testCase.tokenizationFocus.length);
  for (const focus of testCase.tokenizationFocus) {
    if (!evidence.focusTermBehavior.some((entry) => entry.includes(focus))) {
      throw new Error(`${testCase.id}.tokenizerEvidence missing focus term behavior for: ${focus}`);
    }
  }
  if (!["word", "character", "mixed", "simple", "unknown"].includes(evidence.segmentationMode)) {
    throw new Error(`${testCase.id}.tokenizerEvidence.segmentationMode is invalid.`);
  }
}

function validateIndexPerformance(perf) {
  if (!perf || typeof perf !== "object") throw new Error("run.indexPerformance is required.");
  validateNonNegativeNumber(perf.indexBuildMs, "run.indexPerformance.indexBuildMs");
  if (perf.indexSizeBytes !== null) validateNonNegativeNumber(perf.indexSizeBytes, "run.indexPerformance.indexSizeBytes");
  validateNonNegativeNumber(perf.documentCount, "run.indexPerformance.documentCount");
  validateNonNegativeNumber(perf.snippetCount, "run.indexPerformance.snippetCount");
}

function validateQueryPerformance(perf, label) {
  if (!perf || typeof perf !== "object") throw new Error(`${label} is required.`);
  validateNonNegativeNumber(perf.firstQueryMs, `${label}.firstQueryMs`);
  validateNonNegativeNumber(perf.warmQueryMs, `${label}.warmQueryMs`);
  validateNonNegativeNumber(perf.p50Ms, `${label}.p50Ms`);
  validateNonNegativeNumber(perf.p95Ms, `${label}.p95Ms`);
  validateNonNegativeNumber(perf.limit5Ms, `${label}.limit5Ms`);
  validateNonNegativeNumber(perf.limit10Ms, `${label}.limit10Ms`);
  validateNonNegativeNumber(perf.limit20Ms, `${label}.limit20Ms`);
  if (!Number.isInteger(perf.sampleSize) || perf.sampleSize < 1) {
    throw new Error(`${label}.sampleSize must be a positive integer.`);
  }
  if (perf.p95Ms < perf.p50Ms) throw new Error(`${label}.p95Ms must be >= p50Ms.`);
}

function validateExplainEvidence(explain, label) {
  if (!explain || typeof explain !== "object") throw new Error(`${label} is required.`);
  if (typeof explain.available !== "boolean") throw new Error(`${label}.available must be boolean.`);
  requireNonEmptyString(explain.summary, `${label}.summary`);
  if (explain.available) requireStringArray(explain.planHighlights, `${label}.planHighlights`, 1);
}

function validatePolicyEvidence(policy, label) {
  if (!policy || typeof policy !== "object") throw new Error(`${label} is required.`);
  if (policy.defaultRuntimeMutated !== false) throw new Error(`${label}.defaultRuntimeMutated must be false.`);
  if (policy.destructiveActions !== false) throw new Error(`${label}.destructiveActions must be false.`);
  if (policy.rawScoreFusion !== false) throw new Error(`${label}.rawScoreFusion must be false.`);
  if (typeof policy.isolatedRuntime !== "boolean") throw new Error(`${label}.isolatedRuntime must be boolean.`);
  requireNonEmptyString(policy.notes, `${label}.notes`);
}

function validateThreshold(value, label, min, max) {
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}.`);
  }
}

function validateNonNegativeNumber(value, label) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
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

function requireStringArray(value, label, minLength) {
  if (!Array.isArray(value) || value.length < minLength || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${label} must be an array of at least ${minLength} non-empty strings.`);
  }
}

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
