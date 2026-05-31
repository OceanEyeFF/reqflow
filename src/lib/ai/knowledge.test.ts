import { describe, expect, it, vi } from "vitest";
import { assembleKnowledgeContext, knowledgeSources, toDraftCitations } from "./knowledge";

const mocks = vi.hoisted(() => ({
  buildHybridContextWindow: vi.fn(async () => ({
    contextText: "",
    citations: [],
    citationGroups: [],
    debugEvidence: createDebugEvidence(),
  })),
}));

vi.mock("@/lib/knowledge/retrieval", () => ({
  buildHybridContextWindow: mocks.buildHybridContextWindow,
}));

describe("knowledgeSources", () => {
  it("uses the MS6 rf source whitelist", () => {
    expect(knowledgeSources().map((source) => source.sourceId)).toEqual([
      "rf-ai-mvp-boundary",
      "rf-ai-discussion-flow",
      "rf-ticket-domain-schema",
      "rf-ticket-types",
      "rf-ticket-create-api",
      "rf-ticket-create-ui",
      "rf-api-test-boundary",
      "rf-project-baseline",
    ]);
  });
});

describe("assembleKnowledgeContext", () => {
  it("passes selected knowledge base ids and context caps to hybrid retrieval", async () => {
    await assembleKnowledgeContext("需要审批流程", { knowledgeBaseIds: ["base-a"] });

    expect(mocks.buildHybridContextWindow).toHaveBeenCalledWith("需要审批流程", {
      knowledgeBaseIds: ["base-a"],
      maxContextChars: 1600,
      adjacentChunks: 1,
    });
  });

  it("does not append built-in snippets when a knowledge base scope is selected", async () => {
    mocks.buildHybridContextWindow.mockResolvedValueOnce({
      contextText: "selected knowledge only",
      citations: [
        {
          sourceId: "persisted-a",
          sourceTitle: "Selected base guide",
          path: "docs/a.md",
          section: "Guide",
          snippet: "selected knowledge only",
          freshness: "test",
        },
      ],
      citationGroups: [],
      debugEvidence: createDebugEvidence({ knowledgeBaseIds: ["base-a"] }),
    });

    const context = await assembleKnowledgeContext("需要审批流程", { knowledgeBaseIds: ["base-a"] });

    expect(context.knowledge).toEqual([
      {
        sourceId: "persisted-a",
        sourceTitle: "Selected base guide",
        path: "docs/a.md",
        section: "Guide",
        snippet: "selected knowledge only",
        freshness: "test",
      },
    ]);
    expect(context.searchEvidence?.filters.knowledgeBaseIds).toEqual(["base-a"]);
  });

  it("returns safe snippets without test passwords", async () => {
    const context = await assembleKnowledgeContext("需要一个新 ticket 创建需求，包含 priority 和 draft");

    expect(context.knowledge.length).toBeGreaterThan(0);
    expect(context.knowledge.length).toBeLessThanOrEqual(5);
    expect(context.knowledge.map((citation) => citation.sourceId)).toContain("rf-ai-mvp-boundary");
    expect(context.knowledge.map((citation) => citation.sourceId)).toContain("rf-ai-discussion-flow");
    expect(context.knowledge.map((citation) => citation.sourceId)).toContain("rf-ticket-types");
    expect(JSON.stringify(context)).not.toMatch(/admin123|manager123|user123/);
  });

  it("maps server citations to draft citations", async () => {
    const context = await assembleKnowledgeContext("api test auth validation");

    expect(toDraftCitations(context.knowledge)[0]).toEqual({
      sourceId: context.knowledge[0].sourceId,
      sourceTitle: context.knowledge[0].sourceTitle,
      path: context.knowledge[0].path,
      section: context.knowledge[0].section,
      snippet: context.knowledge[0].snippet,
      freshness: context.knowledge[0].freshness,
    });
  });
});

function createDebugEvidence(options: { knowledgeBaseIds?: string[] } = {}) {
  return {
    query: {
      rawQuery: "需要审批流程",
      normalizedQuery: "需要审批流程",
      lexicalQuery: "需要 审批 流程",
      embeddingQuery: "需要审批流程",
      mustTerms: ["审批", "流程"],
      domainEntities: ["审批流程"],
    },
    mode: "hybrid-rrf" as const,
    fusion: {
      algorithm: "reciprocal-rank-fusion" as const,
      k: 60,
      rawScoreAddition: false,
    },
    vectorLane: { status: "failed" as const, reason: "active-profile-missing", evidence: {} },
    reranker: {
      name: "none",
      ran: false,
      acceptedCandidates: 0,
      rejectedCandidates: 0,
    },
    lexicalEvidence: {
      query: {
        rawQuery: "需要审批流程",
        normalizedQuery: "需要审批流程",
        lexicalQuery: "需要 审批 流程",
        embeddingQuery: "需要审批流程",
        mustTerms: ["审批", "流程"],
        domainEntities: ["审批流程"],
      },
      engine: "postgres-native-fts-fallback" as const,
      filters: {
        knowledgeBaseIds: options.knowledgeBaseIds ?? [],
        sourceStatuses: ["ready", "enabled"],
        enabledOnly: true as const,
        versionStatuses: ["ready"],
      },
      candidatesScanned: 0,
      candidatesReturned: 0,
      cap: 3,
      lexicalHits: [],
    },
    vectorHits: [],
    fusedHits: [],
    contextWindow: {
      maxContextChars: 1600,
      adjacentChunks: 1,
      included: [],
      dedupedSnippetIds: [],
      cappedSnippetIds: [],
      skippedSnippetIds: [],
    },
  };
}
