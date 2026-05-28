import type {
  AiDraftResult,
  AiRequirementDraft,
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
        output:
          request.mode === "clarify"
            ? { kind: "clarification", questions: [], canDraftNow: false }
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
    questions?: Array<{ id?: string; question?: string; reason?: string }>;
    canDraftNow?: boolean;
    result?: {
      drafts?: Array<Partial<AiRequirementDraft>>;
      questions?: Array<{ id?: string; question?: string; reason?: string }>;
      canDraftNow?: boolean;
    };
  };
  const citations = toDraftCitations(request.knowledge);

  if (request.mode === "clarify" || parsed.kind === "clarification") {
    const questions = parsed.result?.questions ?? parsed.questions ?? [];
    return {
      kind: "clarification",
      result: {
        questions: questions
          .filter((question) => question.question)
          .slice(0, 5)
          .map((question, index) => ({
            id: question.id || `q${index + 1}`,
            question: question.question || "",
            reason: question.reason || "Clarifies the requirement scope.",
          })),
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

function normalizePriority(priority: unknown): AiRequirementDraft["suggestedPriority"] {
  return priority === "low" || priority === "medium" || priority === "high" || priority === "urgent"
    ? priority
    : "medium";
}
