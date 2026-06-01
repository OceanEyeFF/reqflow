import { readFileSync } from "node:fs";

const fixturePath = process.argv[2] || "docs/ms12-consumables-golden-case.json";
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

validateFixture(fixture);
console.log(`Clarification golden case gate passed: ${fixture.caseId} (${fixture.result.questions.length} questions).`);

function validateFixture(value) {
  requireString(value.caseId, "caseId");
  requireString(value.title, "title");
  requireString(value.input, "input");
  if (!Array.isArray(value.expectedTopics) || value.expectedTopics.length < 6) {
    throw new Error("expectedTopics must contain at least 6 topics.");
  }
  if (!value.result || value.result.kind !== "clarification" || !Array.isArray(value.result.questions)) {
    throw new Error("result must be a clarification object with questions.");
  }
  if (value.result.questions.length < value.expectedTopics.length) {
    throw new Error("result has fewer questions than expected topics.");
  }

  const genericQuestions = value.result.questions.filter(isGenericQuestion);
  if (genericQuestions.length === value.result.questions.length) {
    throw new Error("golden case cannot pass with only generic clarification questions.");
  }

  for (const question of value.result.questions) validateQuestion(question);
  for (const topic of value.expectedTopics) validateTopicCoverage(topic, value.result.questions);
}

function validateTopicCoverage(topic, questions) {
  requireString(topic.id, "topic.id");
  requireString(topic.category, `${topic.id}.category`);
  if (!Array.isArray(topic.requiredTerms) || topic.requiredTerms.length < 2) {
    throw new Error(`${topic.id}.requiredTerms must contain at least 2 terms.`);
  }
  const matchingQuestions = questions.filter((question) => question.category === topic.category);
  if (matchingQuestions.length === 0) {
    throw new Error(`${topic.id} missing category ${topic.category}.`);
  }
  const matched = matchingQuestions.some((question) => {
    const text = `${question.question} ${question.reason} ${question.relatedText}`.toLowerCase();
    return topic.requiredTerms.every((term) => text.includes(String(term).toLowerCase()));
  });
  if (!matched) {
    throw new Error(`${topic.id} missing required terms: ${topic.requiredTerms.join(", ")}`);
  }
  if (topic.blocksDraft === true && !matchingQuestions.some((question) => question.blocksDraft === true || question.priority === "blocking")) {
    throw new Error(`${topic.id} must include a blocking question.`);
  }
}

function validateQuestion(question) {
  requireString(question.id, "question.id");
  requireString(question.question, `${question.id}.question`);
  requireString(question.reason, `${question.id}.reason`);
  requireString(question.category, `${question.id}.category`);
  requireString(question.priority, `${question.id}.priority`);
  requireString(question.basis, `${question.id}.basis`);
  requireString(question.expectedAnswerFormat, `${question.id}.expectedAnswerFormat`);
  if (typeof question.blocksDraft !== "boolean") {
    throw new Error(`${question.id}.blocksDraft must be boolean.`);
  }
  if (!["blocking", "recommended", "optional"].includes(question.priority)) {
    throw new Error(`${question.id}.priority is invalid.`);
  }
  if (question.priority === "blocking" && question.blocksDraft !== true) {
    throw new Error(`${question.id} priority=blocking must set blocksDraft=true.`);
  }
}

function isGenericQuestion(question) {
  const text = `${question.question} ${question.reason}`.toLowerCase();
  return ["目标用户", "使用场景", "成功标准", "需求细节"].some((term) => text.includes(term.toLowerCase()));
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
