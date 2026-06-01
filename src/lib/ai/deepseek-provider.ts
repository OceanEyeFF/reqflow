import type {
  AiDraftResult,
  AiClarificationDirection,
  AiClarificationQuestion,
  ClarificationExpectedAnswerFormat,
  AiRequirementDraft,
  ClarificationDirectionId,
  ClarificationQuestionBasis,
  ClarificationQuestionCategory,
  ClarificationQuestionPriority,
  DraftProvider,
  DraftProviderRequest,
} from "./types";
import { toDraftCitations } from "./knowledge";

type DeepseekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepseekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const CLARIFICATION_DIRECTIONS: Array<{ id: ClarificationDirectionId; label: string }> = [
  { id: "knowledge_basis", label: "知识库依据" },
  { id: "application_scenario", label: "应用场景" },
  { id: "requirement_details", label: "需求细节" },
];
const MAX_QUESTIONS_PER_DIRECTION = 5;
const CLARIFICATION_CATEGORIES: ClarificationQuestionCategory[] = [
  "coverage_gap",
  "exception_rule",
  "actor_boundary",
  "state_flow",
  "failure_path",
  "data_rule",
  "acceptance_risk",
  "knowledge_conflict",
];
const CLARIFICATION_PRIORITIES: ClarificationQuestionPriority[] = ["blocking", "recommended", "optional"];
const CLARIFICATION_BASES: ClarificationQuestionBasis[] = ["knowledge", "coverage_gap", "user_input", "inference"];
const CLARIFICATION_ANSWER_FORMATS: ClarificationExpectedAnswerFormat[] = [
  "free_text",
  "single_choice",
  "multi_choice",
  "number",
  "date",
  "yes_no",
];

export type DeepseekConfig = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
};

export class AiProviderConfigError extends Error {}
export class AiProviderError extends Error {}

export function getDeepseekConfig(env: NodeJS.ProcessEnv = process.env): DeepseekConfig {
  return {
    apiKey: env.DEEPSEEK_API_KEY,
    baseUrl: env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    timeoutMs: Number(env.DEEPSEEK_TIMEOUT_MS || 20000),
  };
}

export function createDeepseekProvider(config = getDeepseekConfig()): DraftProvider {
  return {
    async generate(request) {
      if (!config.apiKey) {
        const baseUrl = config.baseUrl.toLowerCase();
        if (!baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1") && !baseUrl.includes("[::1]")) {
          throw new AiProviderConfigError("Deepseek API key is not configured");
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const headers: Record<string, string> = {
          "content-type": "application/json",
        };
        if (config.apiKey) {
          headers.authorization = `Bearer ${config.apiKey}`;
        }

        const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: config.model,
            messages: buildMessages(request),
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new AiProviderError(`Deepseek request failed with ${response.status}`);
        }

        return normalizeDeepseekResponse((await response.json()) as DeepseekResponse, request);
      } catch (error) {
        if (error instanceof AiProviderConfigError || error instanceof AiProviderError) throw error;
        throw new AiProviderError("Deepseek request failed");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

function buildMessages(request: DraftProviderRequest): DeepseekMessage[] {
  return [
    {
      role: "system",
      content:
        "You draft ReqFlow ticket requirements. Return strict JSON. Use only provided sourceIds for citations. Do not create tickets.",
    },
    {
      role: "user",
      content: JSON.stringify({
        mode: request.mode,
        requirement: request.requirement,
        answers: request.answers,
        answerLanguage: request.answerLanguage,
        languageInstruction: languageInstruction(request.answerLanguage),
        maxDrafts: request.maxDrafts,
        knowledge: request.knowledge,
        coverageDiagnostics: request.coverageDiagnostics,
        output:
          request.mode === "clarify"
            ? {
                kind: "clarification",
                directions: CLARIFICATION_DIRECTIONS.map((direction) => ({
                  id: direction.id,
                  label: direction.label,
                  questions: [],
                })),
                canDraftNow: false,
                instruction:
                  [
                    "Ask business-interrogation questions only. Do not draft tickets in clarify mode.",
                    "Use coverageDiagnostics as first-class evidence: missingCoreTerms, low citationCount, failed vectorLaneStatus, or weak lexical evidence should produce coverage_gap questions instead of pretending coverage exists.",
                    "Cover high-value business risk categories when relevant: coverage_gap, exception_rule, actor_boundary, state_flow, failure_path, data_rule, acceptance_risk, and knowledge_conflict.",
                    "Return exactly these three direction labels and at most five questions for each direction.",
                    "Each question must include category, priority, blocksDraft, basis, reason, relatedText, and expectedAnswerFormat.",
                    "Use priority=blocking and blocksDraft=true when a missing answer would make the draft unsafe, misleading, or unsupported by knowledge evidence.",
                    "Use basis=knowledge only when the provided knowledge directly supports the question; use basis=coverage_gap when coverageDiagnostics shows missing terms or empty citations.",
                  ].join(" "),
                questionSchema: {
                  category: [
                    "coverage_gap",
                    "exception_rule",
                    "actor_boundary",
                    "state_flow",
                    "failure_path",
                    "data_rule",
                    "acceptance_risk",
                    "knowledge_conflict",
                  ],
                  priority: ["blocking", "recommended", "optional"],
                  blocksDraft: "boolean",
                  basis: ["knowledge", "coverage_gap", "user_input", "inference"],
                  relatedText: "short source phrase, missing term, user phrase, or empty string",
                  expectedAnswerFormat: ["free_text", "single_choice", "multi_choice", "number", "date", "yes_no"],
                },
              }
            : {
                kind: "draft or drafts",
                instruction:
                  "Return one draft for a single coherent requirement, or drafts[] with up to maxDrafts items when the request naturally splits into separate tickets.",
                draftShape: {
                  title: "",
                  background: "",
                  userStory: "",
                  acceptanceCriteria: [],
                  pendingQuestions: [],
                  suggestedPriority: "medium",
                  citations: [],
                },
              },
      }),
    },
  ];
}

function languageInstruction(language: DraftProviderRequest["answerLanguage"]): string {
  if (language === "zh") return "Respond in Chinese.";
  if (language === "en") return "Respond in English.";
  return "Respond in the same language as the user's requirement and answers.";
}

function normalizeDeepseekResponse(response: DeepseekResponse, request: DraftProviderRequest): AiDraftResult {
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new AiProviderError("Deepseek response was empty");

  const parsed = JSON.parse(content) as Partial<AiRequirementDraft> & {
    kind?: string;
    drafts?: Array<Partial<AiRequirementDraft>>;
    questions?: RawClarificationQuestion[];
    directions?: Array<{
      id?: string;
      label?: string;
      questions?: RawClarificationQuestion[];
    }>;
    canDraftNow?: boolean;
    result?: {
      drafts?: Array<Partial<AiRequirementDraft>>;
      questions?: RawClarificationQuestion[];
      directions?: Array<{
        id?: string;
        label?: string;
        questions?: RawClarificationQuestion[];
      }>;
      canDraftNow?: boolean;
    };
  };
  const citations = toDraftCitations(request.knowledge);

  if (request.mode === "clarify" || parsed.kind === "clarification") {
    const directions = ensureClarificationQuestions(
      normalizeClarificationDirections(parsed.result?.directions ?? parsed.directions, parsed.result?.questions ?? parsed.questions)
    );
    return {
      kind: "clarification",
      result: {
        questions: directions.flatMap((direction) => direction.questions),
        directions,
        canDraftNow: Boolean(parsed.result?.canDraftNow ?? parsed.canDraftNow),
      },
      citations,
      emptyKnowledge: request.knowledge.length === 0,
    };
  }

  const parsedDrafts = parsed.result?.drafts ?? parsed.drafts;
  if (Array.isArray(parsedDrafts) && parsedDrafts.length > 0) {
    const drafts = parsedDrafts
      .slice(0, request.maxDrafts)
      .map((draft) => normalizeDraft(draft, citations));

    return {
      kind: "drafts",
      result: { drafts },
      citations,
      emptyKnowledge: request.knowledge.length === 0,
    };
  }

  return {
    kind: "draft",
    result: normalizeDraft(parsed, citations),
    citations,
    emptyKnowledge: request.knowledge.length === 0,
  };
}

function normalizeDraft(draft: Partial<AiRequirementDraft>, citations: AiRequirementDraft["citations"]): AiRequirementDraft {
  return {
    title: draft.title || "Untitled requirement draft",
    background: draft.background || "",
    userStory: draft.userStory || "",
    acceptanceCriteria: Array.isArray(draft.acceptanceCriteria) ? draft.acceptanceCriteria : [],
    pendingQuestions: Array.isArray(draft.pendingQuestions) ? draft.pendingQuestions : [],
    suggestedPriority: normalizePriority(draft.suggestedPriority),
    citations,
  };
}

function normalizeClarificationDirections(
  rawDirections:
    | Array<{
        id?: string;
        label?: string;
        questions?: RawClarificationQuestion[];
      }>
    | undefined,
  rawQuestions: RawClarificationQuestion[] | undefined
): AiClarificationDirection[] {
  return CLARIFICATION_DIRECTIONS.map((direction, directionIndex) => {
    const matchingDirection = rawDirections?.find(
      (candidate) => candidate.id === direction.id || candidate.label === direction.label
    );
    const sourceQuestions = matchingDirection?.questions ?? (directionIndex === 2 ? rawQuestions : []);
    const questions = normalizeClarificationQuestions(sourceQuestions, matchingDirection ? direction.id : "q");

    return {
      ...direction,
      questions,
    };
  });
}

function normalizeClarificationQuestions(
  questions: RawClarificationQuestion[] | undefined,
  idPrefix: ClarificationDirectionId | "q"
): AiClarificationQuestion[] {
  return (questions ?? [])
    .filter((question) => question.question)
    .slice(0, MAX_QUESTIONS_PER_DIRECTION)
    .map((question, index) => ({
      id: question.id || (idPrefix === "q" ? `q${index + 1}` : `${idPrefix}-${index + 1}`),
      question: question.question || "",
      reason: question.reason || "Clarifies the requirement scope.",
      category: normalizeQuestionCategory(question.category),
      priority: normalizeQuestionPriority(question.priority),
      blocksDraft: normalizeBlocksDraft(question.blocksDraft, question.priority),
      basis: normalizeQuestionBasis(question.basis),
      relatedText: typeof question.relatedText === "string" ? question.relatedText : "",
      expectedAnswerFormat: normalizeExpectedAnswerFormat(question.expectedAnswerFormat),
    }));
}

function ensureClarificationQuestions(directions: AiClarificationDirection[]): AiClarificationDirection[] {
  if (directions.some((direction) => direction.questions.length > 0)) return directions;

  return directions.map((direction) => ({
    ...direction,
    questions: [createFallbackClarificationQuestion(direction.id)],
  }));
}

function createFallbackClarificationQuestion(directionId: ClarificationDirectionId): AiClarificationQuestion {
  switch (directionId) {
    case "knowledge_basis":
      return {
        id: "knowledge_basis-fallback-1",
        question: "这条需求需要优先依据哪一类知识库材料或业务规则？",
        reason: "AI 未返回该方向的追问，先确认可引用的知识依据。",
        category: "coverage_gap",
        priority: "blocking",
        blocksDraft: true,
        basis: "coverage_gap",
        relatedText: "",
        expectedAnswerFormat: "free_text",
      };
    case "application_scenario":
      return {
        id: "application_scenario-fallback-1",
        question: "这个流程主要发生在哪个业务场景、由哪些角色操作？",
        reason: "AI 未返回该方向的追问，先确认使用场景和参与角色。",
        category: "actor_boundary",
        priority: "recommended",
        blocksDraft: false,
        basis: "user_input",
        relatedText: "",
        expectedAnswerFormat: "free_text",
      };
    case "requirement_details":
      return {
        id: "requirement_details-fallback-1",
        question: "哪些节点、状态或异常分支必须写入工单验收标准？",
        reason: "AI 未返回该方向的追问，先确认可落地的需求细节。",
        category: "acceptance_risk",
        priority: "recommended",
        blocksDraft: false,
        basis: "inference",
        relatedText: "",
        expectedAnswerFormat: "free_text",
      };
  }
}

type RawClarificationQuestion = {
  id?: string;
  question?: string;
  reason?: string;
  category?: unknown;
  priority?: unknown;
  blocksDraft?: unknown;
  basis?: unknown;
  relatedText?: unknown;
  expectedAnswerFormat?: unknown;
};

function normalizeQuestionCategory(category: unknown): ClarificationQuestionCategory {
  return CLARIFICATION_CATEGORIES.includes(category as ClarificationQuestionCategory)
    ? (category as ClarificationQuestionCategory)
    : "data_rule";
}

function normalizeQuestionPriority(priority: unknown): ClarificationQuestionPriority {
  return CLARIFICATION_PRIORITIES.includes(priority as ClarificationQuestionPriority)
    ? (priority as ClarificationQuestionPriority)
    : "recommended";
}

function normalizeBlocksDraft(blocksDraft: unknown, priority: unknown): boolean {
  if (typeof blocksDraft === "boolean") return blocksDraft;
  return priority === "blocking";
}

function normalizeQuestionBasis(basis: unknown): ClarificationQuestionBasis {
  return CLARIFICATION_BASES.includes(basis as ClarificationQuestionBasis) ? (basis as ClarificationQuestionBasis) : "inference";
}

function normalizeExpectedAnswerFormat(format: unknown): ClarificationExpectedAnswerFormat {
  return CLARIFICATION_ANSWER_FORMATS.includes(format as ClarificationExpectedAnswerFormat)
    ? (format as ClarificationExpectedAnswerFormat)
    : "free_text";
}

function normalizePriority(priority: unknown): AiRequirementDraft["suggestedPriority"] {
  return priority === "low" || priority === "medium" || priority === "high" || priority === "urgent"
    ? priority
    : "medium";
}
