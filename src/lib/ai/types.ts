export type DraftPriority = "low" | "medium" | "high" | "urgent";

export type KnowledgeCitation = {
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  snippet: string;
  freshness: string;
};

export type DraftCitation = {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
};

export type AiRequirementDraft = {
  title: string;
  background: string;
  userStory: string;
  acceptanceCriteria: string[];
  pendingQuestions: string[];
  suggestedPriority: DraftPriority;
  citations: DraftCitation[];
};

export type AiClarificationResult = {
  questions: Array<{
    id: string;
    question: string;
    reason: string;
  }>;
  canDraftNow: boolean;
};

export type AiDraftResult =
  | {
      kind: "clarification";
      result: AiClarificationResult;
      citations: DraftCitation[];
      emptyKnowledge: boolean;
    }
  | {
      kind: "draft";
      result: AiRequirementDraft;
      citations: DraftCitation[];
      emptyKnowledge: boolean;
    };

export type DraftMode = "clarify" | "draft";
export type DraftAnswerLanguage = "follow_input" | "zh" | "en";

export type DraftRequest = {
  mode: DraftMode;
  requirement: string;
  answers?: Array<{ question: string; answer: string }>;
  knowledgeBaseIds?: string[];
  answerLanguage?: DraftAnswerLanguage;
};

export type DraftProviderRequest = {
  mode: DraftMode;
  requirement: string;
  answers: Array<{ question: string; answer: string }>;
  knowledgeBaseIds: string[];
  answerLanguage: DraftAnswerLanguage;
  knowledge: KnowledgeCitation[];
};

export interface DraftProvider {
  generate(request: DraftProviderRequest): Promise<AiDraftResult>;
}
