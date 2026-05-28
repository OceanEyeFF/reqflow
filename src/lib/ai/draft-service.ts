import type { AiDraftResult, DraftProvider, DraftRequest } from "./types";
import { assembleKnowledgeContext } from "./knowledge";
import { redactAiText } from "./redaction";

const MIN_REQUIREMENT_LENGTH = 8;

export class AiDraftValidationError extends Error {}

export async function generateRequirementDraft(
  input: unknown,
  provider: DraftProvider
): Promise<AiDraftResult> {
  const request = parseDraftRequest(input);
  const safeRequirement = redactAiText(request.requirement);
  const safeAnswers = (request.answers ?? []).map((answer) => ({
    question: redactAiText(answer.question),
    answer: redactAiText(answer.answer),
  }));
  const knowledge = await assembleKnowledgeContext(safeRequirement, {
    knowledgeBaseIds: request.knowledgeBaseIds ?? [],
  });

  return provider.generate({
    mode: request.mode,
    requirement: safeRequirement,
    answers: safeAnswers,
    knowledgeBaseIds: request.knowledgeBaseIds ?? [],
    answerLanguage: request.answerLanguage ?? "follow_input",
    knowledge,
  });
}

export function parseDraftRequest(input: unknown): DraftRequest {
  if (!input || typeof input !== "object") {
    throw new AiDraftValidationError("请求体不能为空");
  }

  const body = input as Partial<DraftRequest>;
  const mode = body.mode === "draft" ? "draft" : "clarify";
  const requirement = typeof body.requirement === "string" ? body.requirement.trim() : "";
  if (requirement.length < MIN_REQUIREMENT_LENGTH) {
    throw new AiDraftValidationError("需求描述太短");
  }

  const answers = Array.isArray(body.answers)
    ? body.answers
        .filter((answer) => answer && typeof answer.question === "string" && typeof answer.answer === "string")
        .map((answer) => ({
          question: answer.question.trim(),
          answer: answer.answer.trim(),
        }))
    : [];
  const knowledgeBaseIds = Array.isArray(body.knowledgeBaseIds)
    ? Array.from(
        new Set(
          body.knowledgeBaseIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim())
        )
      ).slice(0, 20)
    : [];
  const answerLanguage =
    body.answerLanguage === "zh" || body.answerLanguage === "en" || body.answerLanguage === "follow_input"
      ? body.answerLanguage
      : "follow_input";

  return { mode, requirement, answers, knowledgeBaseIds, answerLanguage };
}
