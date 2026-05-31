import { readFileSync } from "node:fs";

const casesPath = process.argv[2] || "docs/retrieval-evaluation-cases.json";
const resultsPath = process.argv[3];
const corpus = JSON.parse(readFileSync(casesPath, "utf8"));

validateCorpus(corpus);

if (resultsPath) {
  const results = JSON.parse(readFileSync(resultsPath, "utf8"));
  validateResults(corpus.cases, results);
} else {
  console.log(`Retrieval evaluation corpus gate passed: ${corpus.cases.length} cases validated.`);
}

function validateCorpus(value) {
  if (!Number.isInteger(value.version) || value.version < 1) {
    throw new Error("Corpus must include positive integer version.");
  }
  if (!Array.isArray(value.cases) || value.cases.length < 5) {
    throw new Error("Corpus must include at least 5 evaluation cases.");
  }

  const seenIds = new Set();
  const requiredTags = new Set(["lexical-fallback", "selected-scope", "semantic", "forbidden-source", "citation"]);

  for (const testCase of value.cases) {
    validateCase(testCase, seenIds);
    for (const tag of testCase.tags) requiredTags.delete(tag);
  }

  if (requiredTags.size > 0) {
    throw new Error(`Corpus is missing required coverage tags: ${[...requiredTags].join(", ")}`);
  }
}

function validateCase(testCase, seenIds) {
  requireNonEmptyString(testCase.id, "case.id");
  if (seenIds.has(testCase.id)) throw new Error(`Duplicate case id: ${testCase.id}`);
  seenIds.add(testCase.id);

  requireNonEmptyString(testCase.query, `${testCase.id}.query`);
  requireStringArray(testCase.selectedKnowledgeBaseIds, `${testCase.id}.selectedKnowledgeBaseIds`, 1);
  requireStringArray(testCase.expectedSourceIds, `${testCase.id}.expectedSourceIds`, 1);
  requireStringArray(testCase.expectedSnippetIds, `${testCase.id}.expectedSnippetIds`, 1);
  requireStringArray(testCase.mustContainTerms, `${testCase.id}.mustContainTerms`, 3);
  requireStringArray(testCase.forbiddenSourceIds, `${testCase.id}.forbiddenSourceIds`, 1);
  requireStringArray(testCase.tags, `${testCase.id}.tags`, 1);
  validateThreshold(testCase.minRecallAt5, `${testCase.id}.minRecallAt5`, 0.5, 1);
  validateThreshold(testCase.maxNoiseAt5, `${testCase.id}.maxNoiseAt5`, 0, 0.5);

  if (testCase.expectedSourceIds.some((id) => testCase.forbiddenSourceIds.includes(id))) {
    throw new Error(`${testCase.id} has an expected source that is also forbidden.`);
  }
  if (!testCase.citationTraceability?.required) {
    throw new Error(`${testCase.id} must require citation traceability.`);
  }
  requireNonEmptyString(testCase.citationTraceability.sourceIdField, `${testCase.id}.citationTraceability.sourceIdField`);
  requireNonEmptyString(testCase.citationTraceability.snippetIdField, `${testCase.id}.citationTraceability.snippetIdField`);
}

function validateResults(cases, results) {
  if (!Array.isArray(results.results)) {
    throw new Error("Results file must contain a results array.");
  }
  const observedModes = new Set();
  const observedVectorFailureReasons = new Set();
  const expectedCaseIds = new Set(cases.map((testCase) => testCase.id));
  const byId = new Map();

  for (const result of results.results) {
    requireNonEmptyString(result.caseId, "result.caseId");
    if (!expectedCaseIds.has(result.caseId)) {
      throw new Error(`Unknown result case id: ${result.caseId}`);
    }
    if (byId.has(result.caseId)) {
      throw new Error(`Duplicate result case id: ${result.caseId}`);
    }
    byId.set(result.caseId, result);
  }

  for (const testCase of cases) {
    const result = byId.get(testCase.id);
    if (!result) throw new Error(`Missing result for case: ${testCase.id}`);
    requireStringArray(result.returnedSourceIds, `${testCase.id}.returnedSourceIds`, 1);
    requireStringArray(result.returnedSnippetIds, `${testCase.id}.returnedSnippetIds`, 1);
    requireStringArray(result.matchedTerms, `${testCase.id}.matchedTerms`, testCase.mustContainTerms.length);
    if (result.returnedSourceIds.length > 5) {
      throw new Error(`${testCase.id}.returnedSourceIds must contain at most 5 entries.`);
    }
    if (result.returnedSnippetIds.length > 5) {
      throw new Error(`${testCase.id}.returnedSnippetIds must contain at most 5 entries.`);
    }

    const topSourceIds = result.returnedSourceIds;
    const topSnippetIds = result.returnedSnippetIds;
    const sourceRecallAt5 = ratioPresent(testCase.expectedSourceIds, topSourceIds);
    const snippetRecallAt5 = ratioPresent(testCase.expectedSnippetIds, topSnippetIds);
    const recallAt5 = Math.min(sourceRecallAt5, snippetRecallAt5);
    const noiseAt5 = calculateNoiseAt5(testCase.expectedSourceIds, topSourceIds);

    validateThreshold(recallAt5, `${testCase.id}.derivedRecallAt5`, testCase.minRecallAt5, 1);
    validateThreshold(noiseAt5, `${testCase.id}.derivedNoiseAt5`, 0, testCase.maxNoiseAt5);

    for (const sourceId of testCase.expectedSourceIds) {
      if (!topSourceIds.includes(sourceId)) {
        throw new Error(`${testCase.id} did not return expected source in top 5: ${sourceId}`);
      }
    }
    for (const snippetId of testCase.expectedSnippetIds) {
      if (!topSnippetIds.includes(snippetId)) {
        throw new Error(`${testCase.id} did not return expected snippet in top 5: ${snippetId}`);
      }
    }
    for (const term of testCase.mustContainTerms) {
      if (!result.matchedTerms.includes(term)) {
        throw new Error(`${testCase.id} did not report required matched term: ${term}`);
      }
    }
    for (const forbidden of testCase.forbiddenSourceIds) {
      if (topSourceIds.includes(forbidden)) {
        throw new Error(`${testCase.id} returned forbidden source: ${forbidden}`);
      }
    }
    if (testCase.citationTraceability.required && result.citationTraceabilityPassed !== true) {
      throw new Error(`${testCase.id} failed citation traceability.`);
    }
    validateHybridEvidence(testCase, result);
    observedModes.add(result.retrievalMode);
    if (result.debugEvidence.vectorLane.status !== "ready") {
      observedVectorFailureReasons.add(result.debugEvidence.vectorLane.reason);
    }
  }
  for (const mode of ["lexical-only", "vector-only", "hybrid-fusion", "context-window"]) {
    if (!observedModes.has(mode)) {
      throw new Error(`Results file must include ${mode} coverage.`);
    }
  }
  if (![...observedVectorFailureReasons].some((reason) => reason.includes("provider"))) {
    throw new Error("Results file must include embedding provider failure coverage.");
  }
  if (![...observedVectorFailureReasons].some((reason) => reason.includes("dimensions-mismatch"))) {
    throw new Error("Results file must include vector profile dimensions-mismatch coverage.");
  }
  console.log(`Retrieval evaluation result gate passed: ${results.results.length} results validated.`);
}

function validateHybridEvidence(testCase, result) {
  const requiredModes = ["lexical-only", "vector-only", "hybrid-fusion", "context-window"];
  const returnedSnippetIds = new Set(result.returnedSnippetIds);
  requireNonEmptyString(result.retrievalMode, `${testCase.id}.retrievalMode`);
  if (!requiredModes.includes(result.retrievalMode)) {
    throw new Error(`${testCase.id}.retrievalMode must be one of: ${requiredModes.join(", ")}`);
  }
  const evidence = result.debugEvidence;
  if (!evidence || typeof evidence !== "object") {
    throw new Error(`${testCase.id}.debugEvidence is required.`);
  }
  requireStringArray(evidence.filterReasons, `${testCase.id}.debugEvidence.filterReasons`, 1);
  if (typeof evidence.rawScoreAddition !== "boolean" || evidence.rawScoreAddition !== false) {
    throw new Error(`${testCase.id}.debugEvidence.rawScoreAddition must be false.`);
  }
  if (!Array.isArray(evidence.fusedHits) || evidence.fusedHits.length === 0 || evidence.fusedHits.length > 5) {
    throw new Error(`${testCase.id}.debugEvidence.fusedHits must contain 1-5 hits.`);
  }
  const fusedSnippetIds = new Set();
  for (const hit of evidence.fusedHits) {
    requireNonEmptyString(hit.snippetId, `${testCase.id}.debugEvidence.fusedHits.snippetId`);
    if (!returnedSnippetIds.has(hit.snippetId)) {
      throw new Error(`${testCase.id}.debugEvidence.fusedHits contains snippet outside returnedSnippetIds: ${hit.snippetId}`);
    }
    fusedSnippetIds.add(hit.snippetId);
    validateThreshold(hit.fusedRank, `${testCase.id}.debugEvidence.fusedHits.fusedRank`, 1, 5);
    if (!hit.rrf || typeof hit.rrf.lexicalContribution !== "number" || typeof hit.rrf.vectorContribution !== "number") {
      throw new Error(`${testCase.id}.debugEvidence.fusedHits must include RRF contribution evidence.`);
    }
  }
  for (const snippetId of returnedSnippetIds) {
    if (!fusedSnippetIds.has(snippetId)) {
      throw new Error(`${testCase.id}.debugEvidence.fusedHits is missing returned snippet: ${snippetId}`);
    }
  }
  if (!evidence.vectorLane || !["ready", "failed", "skipped"].includes(evidence.vectorLane.status)) {
    throw new Error(`${testCase.id}.debugEvidence.vectorLane.status is invalid.`);
  }
  if (evidence.vectorLane.status !== "ready") {
    requireNonEmptyString(evidence.vectorLane.reason, `${testCase.id}.debugEvidence.vectorLane.reason`);
  }
  if (!evidence.contextWindow || typeof evidence.contextWindow !== "object") {
    throw new Error(`${testCase.id}.debugEvidence.contextWindow is required.`);
  }
  if (!Number.isInteger(evidence.contextWindow.maxContextChars) || evidence.contextWindow.maxContextChars < 1) {
    throw new Error(`${testCase.id}.debugEvidence.contextWindow.maxContextChars must be positive.`);
  }
  if (
    typeof evidence.contextWindow.contextChars !== "number" ||
    evidence.contextWindow.contextChars < 0 ||
    evidence.contextWindow.contextChars > evidence.contextWindow.maxContextChars
  ) {
    throw new Error(`${testCase.id}.debugEvidence.contextWindow.contextChars must be between 0 and maxContextChars.`);
  }
  requireStringArray(evidence.contextWindow.includedSnippetIds, `${testCase.id}.debugEvidence.contextWindow.includedSnippetIds`, 1);
  const includedSnippetIds = new Set(evidence.contextWindow.includedSnippetIds);
  for (const snippetId of returnedSnippetIds) {
    if (!includedSnippetIds.has(snippetId)) {
      throw new Error(`${testCase.id}.debugEvidence.contextWindow is missing returned snippet: ${snippetId}`);
    }
  }

  for (const tag of testCase.tags) {
    if (tag === "semantic" || tag === "fusion") {
      if (evidence.vectorLane.status !== "ready") throw new Error(`${testCase.id} requires ready vector lane evidence.`);
    }
    if (tag === "forbidden-source" || tag === "lifecycle-filter" || tag === "selected-scope") {
      if (!evidence.filterReasons.some((reason) => reason.includes("forbidden") || reason.includes("selected") || reason.includes("disabled"))) {
        throw new Error(`${testCase.id} requires explicit filter reason evidence.`);
      }
    }
    if (tag === "context-builder") {
      if (result.retrievalMode !== "context-window") throw new Error(`${testCase.id} requires context-window retrievalMode.`);
    }
  }
}

function validateThreshold(value, label, min, max) {
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}.`);
  }
}

function ratioPresent(expectedIds, returnedIds) {
  const returned = new Set(returnedIds);
  return expectedIds.filter((id) => returned.has(id)).length / expectedIds.length;
}

function calculateNoiseAt5(expectedSourceIds, returnedSourceIds) {
  if (returnedSourceIds.length === 0) return 0;
  const expected = new Set(expectedSourceIds);
  const noisyCount = returnedSourceIds.filter((id) => !expected.has(id)).length;
  return noisyCount / returnedSourceIds.length;
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
