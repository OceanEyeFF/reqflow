import type { DraftCitation, KnowledgeCitation } from "./types";

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

export async function assembleKnowledgeContext(requirement: string): Promise<KnowledgeCitation[]> {
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

  return [...selected, ...scored].slice(0, 5).map(citationFromSource);
}

export function toDraftCitations(citations: KnowledgeCitation[]): DraftCitation[] {
  return citations.map(({ sourceId, sourceTitle, snippet }) => ({
    sourceId,
    sourceTitle,
    snippet,
  }));
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
