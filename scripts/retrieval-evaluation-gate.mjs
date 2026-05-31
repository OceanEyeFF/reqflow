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
  const byId = new Map(results.results.map((result) => [result.caseId, result]));
  for (const testCase of cases) {
    const result = byId.get(testCase.id);
    if (!result) throw new Error(`Missing result for case: ${testCase.id}`);
    requireStringArray(result.returnedSourceIds, `${testCase.id}.returnedSourceIds`, 1);
    requireStringArray(result.returnedSnippetIds, `${testCase.id}.returnedSnippetIds`, 1);
    requireStringArray(result.matchedTerms, `${testCase.id}.matchedTerms`, testCase.mustContainTerms.length);

    const topSourceIds = result.returnedSourceIds.slice(0, 5);
    const topSnippetIds = result.returnedSnippetIds.slice(0, 5);
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
  }
  console.log(`Retrieval evaluation result gate passed: ${results.results.length} results validated.`);
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
