import { describe, expect, it, vi } from "vitest";
import { assembleKnowledgeContext, knowledgeSources, toDraftCitations } from "./knowledge";

const mocks = vi.hoisted(() => ({
  buildHybridContextWindow: vi.fn(async () => ({
    contextText: "",
    citations: [],
    citationGroups: [],
    debugEvidence: {},
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
      debugEvidence: {},
    });

    const context = await assembleKnowledgeContext("需要审批流程", { knowledgeBaseIds: ["base-a"] });

    expect(context).toEqual([
      {
        sourceId: "persisted-a",
        sourceTitle: "Selected base guide",
        path: "docs/a.md",
        section: "Guide",
        snippet: "selected knowledge only",
        freshness: "test",
      },
    ]);
  });

  it("returns safe snippets without test passwords", async () => {
    const context = await assembleKnowledgeContext("需要一个新 ticket 创建需求，包含 priority 和 draft");

    expect(context.length).toBeGreaterThan(0);
    expect(context.length).toBeLessThanOrEqual(5);
    expect(context.map((citation) => citation.sourceId)).toContain("rf-ai-mvp-boundary");
    expect(context.map((citation) => citation.sourceId)).toContain("rf-ai-discussion-flow");
    expect(context.map((citation) => citation.sourceId)).toContain("rf-ticket-types");
    expect(JSON.stringify(context)).not.toMatch(/admin123|manager123|user123/);
  });

  it("maps server citations to draft citations", async () => {
    const context = await assembleKnowledgeContext("api test auth validation");

    expect(toDraftCitations(context)[0]).toEqual({
      sourceId: context[0].sourceId,
      sourceTitle: context[0].sourceTitle,
      snippet: context[0].snippet,
    });
  });
});
