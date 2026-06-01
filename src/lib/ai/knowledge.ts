import type { AiCitationGroup, AiCoverageDiagnostics, AiSearchEvidence, DraftCitation, KnowledgeCitation } from "./types";
import { buildHybridContextWindow, type CitationGroup, type ContextWindowResult } from "@/lib/knowledge/retrieval";

const MAX_AI_DRAFT_CONTEXT_CITATIONS = 5;
const AI_DRAFT_CONTEXT_MAX_CHARS = 1600;
const AI_DRAFT_CONTEXT_ADJACENT_CHUNKS = 1;

type KnowledgeSource = {
  sourceId: string;
  sourceTitle: string;
  path: string;
  freshness: string;
  keywords: string[];
  snippet: string;
};

const SOURCES: KnowledgeSource[] = [
  {
    sourceId: "rf-ai-mvp-boundary",
    sourceTitle: "AI MVP technical boundary",
    path: "docs/ai-mvp-technical-brief.md",
    freshness: "MS6 provider and scope brief",
    keywords: ["ai", "deepseek", "manual", "confirmation", "privacy", "knowledge"],
    snippet:
      "The MS6 AI MVP is a lightweight server-side Deepseek-backed discussion workflow. AI output is advisory until the user explicitly confirms it, and administrator knowledge-base upload plus docs-style zip import are deferred to MS7.",
  },
  {
    sourceId: "rf-ai-discussion-flow",
    sourceTitle: "AI requirement discussion product flow",
    path: "docs/ai-discussion-product-flow.md",
    freshness: "MS6 product-flow contract",
    keywords: ["discussion", "draft", "clarification", "citation", "handoff"],
    snippet:
      "The discussion flow moves from user requirement input to AI clarification, draft generation, draft review, and handoff into the existing ticket creation form. Provider output cannot call /api/tickets directly.",
  },
  {
    sourceId: "rf-ticket-domain-schema",
    sourceTitle: "Ticket domain schema",
    path: "prisma/schema.prisma",
    freshness: "current develop schema",
    keywords: ["ticket", "comment", "member", "attachment", "notification", "log"],
    snippet:
      "The Ticket model stores title, description, type, priority, status, creatorId, assigneeId, dueDate, createdAt, updatedAt, and closedAt. Structured AI sections must be composed into description in MS6.",
  },
  {
    sourceId: "rf-ticket-types",
    sourceTitle: "Ticket constants and labels",
    path: "src/types/index.ts",
    freshness: "current develop constants",
    keywords: ["priority", "type", "status", "label", "urgent", "需求"],
    snippet:
      "Valid ticket priorities are low, medium, high, and urgent. Valid ticket types include 需求, Bug, 设计, 文案, 数据, 运营, and 其他. Draft output must use enum values, not display labels, for priority.",
  },
  {
    sourceId: "rf-ticket-create-api",
    sourceTitle: "Ticket creation API",
    path: "src/app/api/tickets/route.ts",
    freshness: "current create route",
    keywords: ["create", "post", "title", "description", "priority", "assignee"],
    snippet:
      "POST /api/tickets requires authentication and a non-empty title, validates type and priority, creates the ticket with pending status, writes a creation log, and notifies an assignee when present.",
  },
  {
    sourceId: "rf-ticket-create-ui",
    sourceTitle: "Ticket creation UI",
    path: "src/app/(dashboard)/tickets/new/page.tsx",
    freshness: "current new-ticket page",
    keywords: ["form", "title", "description", "priority", "dueDate", "assignee"],
    snippet:
      "The existing new-ticket page owns form state for title, description, type, priority, assigneeId, and dueDate, then submits that form to POST /api/tickets. AI handoff should prefill this form.",
  },
  {
    sourceId: "rf-api-test-boundary",
    sourceTitle: "API route testing guide",
    path: "docs/api-route-testing.md",
    freshness: "current route testing guide",
    keywords: ["test", "auth", "route", "validation", "mock"],
    snippet:
      "API route tests should cover successful, unauthenticated, invalid-input, and authorization paths where applicable. Route auth is controlled by mocking auth helpers in Vitest.",
  },
  {
    sourceId: "rf-project-baseline",
    sourceTitle: "ReqFlow product baseline",
    path: "README.md",
    freshness: "current develop README",
    keywords: ["reqflow", "ticket", "notification", "collaborator", "stack"],
    snippet:
      "ReqFlow is a lightweight internal ticket requirement collaboration system with ticket management, collaborator management, attachment upload, notifications, and operation logs.",
  },
];

export function knowledgeSources(): KnowledgeSource[] {
  return [...SOURCES];
}

export type AssembleKnowledgeOptions = {
  knowledgeBaseIds?: string[];
};

export type AssembledKnowledgeContext = {
  knowledge: KnowledgeCitation[];
  citationGroups: AiCitationGroup[];
  searchEvidence?: AiSearchEvidence;
};

export async function assembleKnowledgeContext(
  requirement: string,
  options: AssembleKnowledgeOptions = {}
): Promise<AssembledKnowledgeContext> {
  const knowledgeBaseIds = options.knowledgeBaseIds ?? [];
  const persistedContext = await buildHybridContextWindow(requirement, {
    knowledgeBaseIds,
    maxContextChars: AI_DRAFT_CONTEXT_MAX_CHARS,
    adjacentChunks: AI_DRAFT_CONTEXT_ADJACENT_CHUNKS,
  });
  const persisted = persistedContext.citations;
  const searchEvidence = toSafeSearchEvidence(persistedContext);
  if (knowledgeBaseIds.length > 0) {
    return {
      knowledge: persisted.slice(0, MAX_AI_DRAFT_CONTEXT_CITATIONS),
      citationGroups: toSafeCitationGroups(persistedContext.citationGroups),
      searchEvidence,
    };
  }

  const loweredRequirement = requirement.toLowerCase();
  const selected = SOURCES.filter(
    (source) => source.sourceId === "rf-ai-mvp-boundary" || source.sourceId === "rf-ai-discussion-flow"
  );
  const scored = SOURCES
    .filter((source) => !selected.some((selectedSource) => selectedSource.sourceId === source.sourceId))
    .map((source) => ({
      source,
      score: source.keywords.filter((keyword) => loweredRequirement.includes(keyword.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ source }) => source);

  return {
    knowledge: [...persisted, ...selected.map(citationFromSource), ...scored.map(citationFromSource)].slice(0, MAX_AI_DRAFT_CONTEXT_CITATIONS),
    citationGroups: toSafeCitationGroups(persistedContext.citationGroups),
    searchEvidence,
  };
}

export function toDraftCitations(citations: KnowledgeCitation[]): DraftCitation[] {
  return citations.map(({ sourceId, sourceTitle, path, section, snippet, freshness }) => ({
    sourceId,
    sourceTitle,
    path,
    section,
    snippet,
    freshness,
  }));
}

export function toSafeCitationGroups(groups: CitationGroup[]): AiCitationGroup[] {
  return groups.map((group) => ({
    sourceId: group.sourceId,
    sourceTitle: group.sourceTitle,
    path: group.path,
    section: group.section,
    snippetCount: group.snippetIds.length,
    snippets: group.snippets,
  }));
}

export function toSafeSearchEvidence(result: ContextWindowResult): AiSearchEvidence {
  const evidence = result.debugEvidence;
  const coverageDiagnostics = toCoverageDiagnostics(result);
  return {
    query: {
      normalizedQuery: evidence.query.normalizedQuery,
      lexicalQuery: evidence.query.lexicalQuery,
      embeddingQuery: evidence.query.embeddingQuery,
      mustTerms: evidence.query.mustTerms,
      domainEntities: evidence.query.domainEntities,
    },
    filters: {
      knowledgeBaseIds: evidence.lexicalEvidence.filters.knowledgeBaseIds,
      sourceStatuses: evidence.lexicalEvidence.filters.sourceStatuses,
      enabledOnly: evidence.lexicalEvidence.filters.enabledOnly,
      versionStatuses: evidence.lexicalEvidence.filters.versionStatuses,
    },
    lexical: {
      candidatesScanned: evidence.lexicalEvidence.candidatesScanned,
      candidatesReturned: evidence.lexicalEvidence.candidatesReturned,
      cap: evidence.lexicalEvidence.cap,
      hits: evidence.lexicalEvidence.lexicalHits.map((hit) => ({
        sourceId: hit.sourceId,
        sourceTitle: hit.sourceTitle,
        path: hit.path,
        section: hit.section,
        rank: hit.rank,
        score: hit.score,
        matchedTerms: hit.matchedTerms,
        mustTermsMatched: hit.mustTermsMatched,
        lexicalTextSource: hit.lexicalTextSource,
      })),
    },
    vectorLane:
      evidence.vectorLane.status === "ready"
        ? { status: "ready", candidatesReturned: evidence.vectorLane.candidatesReturned }
        : { status: "failed", reason: evidence.vectorLane.reason },
    vector: {
      hits: evidence.vectorHits.map((hit) => ({
        sourceId: hit.sourceId,
        sourceTitle: hit.sourceTitle,
        path: hit.path,
        section: hit.section,
        rank: hit.rank,
        score: hit.score,
      })),
    },
    fusion: {
      algorithm: evidence.fusion.algorithm,
      k: evidence.fusion.k,
      hits: evidence.fusedHits.map((hit) => ({
        sourceId: hit.sourceId,
        sourceTitle: hit.sourceTitle,
        path: hit.path,
        section: hit.section,
        fusedRank: hit.fusedRank,
        fusedScore: hit.fusedScore,
        lexicalRank: hit.lexicalRank,
        vectorRank: hit.vectorRank,
      })),
    },
    contextWindow: {
      maxContextChars: evidence.contextWindow.maxContextChars,
      adjacentChunks: evidence.contextWindow.adjacentChunks,
      includedCount: evidence.contextWindow.included.length,
      dedupedCount: evidence.contextWindow.dedupedSnippetIds.length,
      cappedCount: evidence.contextWindow.cappedSnippetIds.length,
      skippedCount: evidence.contextWindow.skippedSnippetIds.length,
      included: evidence.contextWindow.included.map((item) => ({
        sourceId: item.sourceId,
        sourceTitle: item.sourceTitle,
        path: item.path,
        section: item.section,
        chunkIndex: item.chunkIndex,
        reason: item.reason,
        chars: item.chars,
      })),
    },
    citationGroups: toSafeCitationGroups(result.citationGroups),
    coverageDiagnostics,
  };
}

function toCoverageDiagnostics(result: ContextWindowResult): AiCoverageDiagnostics {
  const evidence = result.debugEvidence;
  const matchedCoreTerms = Array.from(
    new Set(evidence.lexicalEvidence.lexicalHits.flatMap((hit) => hit.mustTermsMatched))
  );
  const matched = new Set(matchedCoreTerms);

  return {
    selectedKnowledgeBaseIds: evidence.lexicalEvidence.filters.knowledgeBaseIds,
    citationCount: result.citations.length,
    matchedCoreTerms,
    missingCoreTerms: evidence.query.mustTerms.filter((term) => !matched.has(term)),
    vectorLaneStatus:
      evidence.vectorLane.status === "ready"
        ? { status: "ready", candidatesReturned: evidence.vectorLane.candidatesReturned }
        : { status: "failed", reason: evidence.vectorLane.reason },
    lexicalEngine: evidence.lexicalEvidence.engine,
    lexicalCandidatesScanned: evidence.lexicalEvidence.candidatesScanned,
    lexicalCandidatesReturned: evidence.lexicalEvidence.candidatesReturned,
  };
}

function citationFromSource(source: KnowledgeSource): KnowledgeCitation {
  return {
    sourceId: source.sourceId,
    sourceTitle: source.sourceTitle,
    path: source.path,
    snippet: source.snippet,
    freshness: source.freshness,
  };
}
