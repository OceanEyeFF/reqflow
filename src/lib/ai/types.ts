import type { LexicalEngineId } from "@/lib/knowledge/lexical-engines";

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
  path?: string;
  section?: string;
  snippet: string;
  freshness?: string;
};

export type AiCitationGroup = {
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  snippetCount: number;
  snippets: string[];
};

export type AiCoverageDiagnostics = {
  selectedKnowledgeBaseIds: string[];
  citationCount: number;
  matchedCoreTerms: string[];
  missingCoreTerms: string[];
  vectorLaneStatus:
    | { status: "ready"; candidatesReturned: number }
    | { status: "failed"; reason: string };
  lexicalEngine: LexicalEngineId;
  lexicalCandidatesScanned: number;
  lexicalCandidatesReturned: number;
};

export type AiSearchEvidence = {
  query: {
    normalizedQuery: string;
    lexicalQuery: string;
    embeddingQuery: string;
    mustTerms: string[];
    domainEntities: string[];
  };
  filters: {
    knowledgeBaseIds: string[];
    sourceStatuses: string[];
    enabledOnly: boolean;
    versionStatuses: string[];
  };
  lexical: {
    candidatesScanned: number;
    candidatesReturned: number;
    cap: number;
    hits: Array<{
      sourceId: string;
      sourceTitle: string;
      path: string;
      section?: string;
      rank: number;
      score: number;
      matchedTerms: string[];
      mustTermsMatched: string[];
      lexicalTextSource: "metadata" | "content";
    }>;
  };
  vectorLane:
    | { status: "ready"; candidatesReturned: number }
    | { status: "failed"; reason: string };
  vector: {
    hits: Array<{
      sourceId: string;
      sourceTitle: string;
      path: string;
      section?: string;
      rank: number;
      score: number;
    }>;
  };
  fusion: {
    algorithm: "reciprocal-rank-fusion";
    k: number;
    hits: Array<{
      sourceId: string;
      sourceTitle: string;
      path: string;
      section?: string;
      fusedRank: number;
      fusedScore: number;
      lexicalRank?: number;
      vectorRank?: number;
    }>;
  };
  contextWindow: {
    maxContextChars: number;
    adjacentChunks: number;
    includedCount: number;
    dedupedCount: number;
    cappedCount: number;
    skippedCount: number;
    included: Array<{
      sourceId: string;
      sourceTitle: string;
      path: string;
      section?: string;
      chunkIndex: number;
      reason: "selected-hit" | "adjacent";
      chars: number;
    }>;
  };
  citationGroups: AiCitationGroup[];
  coverageDiagnostics: AiCoverageDiagnostics;
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

export type ClarificationDirectionId = "knowledge_basis" | "application_scenario" | "requirement_details";

export type AiClarificationQuestion = {
  id: string;
  question: string;
  reason: string;
};

export type AiClarificationDirection = {
  id: ClarificationDirectionId;
  label: string;
  questions: AiClarificationQuestion[];
};

export type AiClarificationResult = {
  questions: AiClarificationQuestion[];
  directions: AiClarificationDirection[];
  canDraftNow: boolean;
};

export type AiDraftResult =
  | {
      kind: "clarification";
      result: AiClarificationResult;
      citations: DraftCitation[];
      emptyKnowledge: boolean;
      searchEvidence?: AiSearchEvidence;
    }
  | {
      kind: "draft";
      result: AiRequirementDraft;
      citations: DraftCitation[];
      emptyKnowledge: boolean;
      searchEvidence?: AiSearchEvidence;
    }
  | {
      kind: "drafts";
      result: { drafts: AiRequirementDraft[] };
      citations: DraftCitation[];
      emptyKnowledge: boolean;
      searchEvidence?: AiSearchEvidence;
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
  maxDrafts: number;
  knowledge: KnowledgeCitation[];
  coverageDiagnostics?: AiCoverageDiagnostics;
};

export interface DraftProvider {
  generate(request: DraftProviderRequest): Promise<AiDraftResult>;
}
