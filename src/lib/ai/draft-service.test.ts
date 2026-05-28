import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MAX_DRAFTS, generateRequirementDraft, parseDraftRequest, parseMaxDrafts } from "./draft-service";
import type { DraftProvider } from "./types";

const mocks = vi.hoisted(() => ({
  selectKnowledgeSnippets: vi.fn(async () => []),
}));

vi.mock("@/lib/knowledge/retrieval", () => ({
  selectKnowledgeSnippets: mocks.selectKnowledgeSnippets,
}));

describe("parseDraftRequest", () => {
  it("rejects weak requirement input", () => {
    expect(() => parseDraftRequest({ requirement: "短" })).toThrow("需求描述太短");
  });

  it("normalizes mode and answers", () => {
    expect(
      parseDraftRequest({
        mode: "draft",
        requirement: "需要一个能追踪审批状态的需求",
        answers: [{ question: "谁使用？", answer: "项目经理" }, { question: "", answer: 1 }],
      })
    ).toEqual({
      mode: "draft",
      requirement: "需要一个能追踪审批状态的需求",
      answers: [{ question: "谁使用？", answer: "项目经理" }],
      knowledgeBaseIds: [],
      answerLanguage: "follow_input",
    });
  });

  it("normalizes selected knowledge base ids", () => {
    expect(
      parseDraftRequest({
        requirement: "需要一个能追踪审批状态的需求",
        knowledgeBaseIds: [" kb-1 ", "", "kb-1", 3, "kb-2"],
      })
    ).toMatchObject({
      knowledgeBaseIds: ["kb-1", "kb-2"],
      answerLanguage: "follow_input",
    });
  });

  it("normalizes answer language", () => {
    expect(
      parseDraftRequest({
        mode: "draft",
        requirement: "需要一个能追踪审批状态的需求",
        answerLanguage: "zh",
      })
    ).toMatchObject({ answerLanguage: "zh" });
    expect(
      parseDraftRequest({
        mode: "draft",
        requirement: "需要一个能追踪审批状态的需求",
        answerLanguage: "bad",
      })
    ).toMatchObject({ answerLanguage: "follow_input" });
  });
});

describe("parseMaxDrafts", () => {
  it("defaults and clamps the configurable draft count", () => {
    expect(parseMaxDrafts({})).toBe(DEFAULT_MAX_DRAFTS);
    expect(parseMaxDrafts({ AI_MAX_DRAFTS: "bad" })).toBe(DEFAULT_MAX_DRAFTS);
    expect(parseMaxDrafts({ AI_MAX_DRAFTS: "0" })).toBe(1);
    expect(parseMaxDrafts({ AI_MAX_DRAFTS: "2.8" })).toBe(2);
    expect(parseMaxDrafts({ AI_MAX_DRAFTS: "9" })).toBe(DEFAULT_MAX_DRAFTS);
  });
});

describe("generateRequirementDraft", () => {
  it("redacts sensitive input before provider calls and supports empty knowledge fallback", async () => {
    const provider: DraftProvider = {
      generate: vi.fn(async (request) => ({
        kind: "clarification",
        result: {
          questions: [{ id: "q1", question: "谁审批？", reason: "确认流程" }],
          directions: [
            { id: "knowledge_basis", label: "知识库依据", questions: [] },
            { id: "application_scenario", label: "应用场景", questions: [] },
            { id: "requirement_details", label: "需求细节", questions: [{ id: "q1", question: "谁审批？", reason: "确认流程" }] },
          ],
          canDraftNow: false,
        },
        citations: [],
        emptyKnowledge: request.knowledge.length === 0,
      })),
    };

    const result = await generateRequirementDraft(
      { requirement: "需要审批流，DEEPSEEK_API_KEY=real-secret 不要泄露" },
      provider
    );

    expect(provider.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        requirement: expect.stringContaining("[redacted]"),
        knowledgeBaseIds: [],
        answerLanguage: "follow_input",
        maxDrafts: DEFAULT_MAX_DRAFTS,
      })
    );
    expect(JSON.stringify(vi.mocked(provider.generate).mock.calls)).not.toContain("real-secret");
    expect(result.kind).toBe("clarification");
  });

  it("passes selected knowledge base ids to the provider request", async () => {
    const provider: DraftProvider = {
      generate: vi.fn(async () => ({
        kind: "clarification",
        result: {
          questions: [],
          directions: [
            { id: "knowledge_basis", label: "知识库依据", questions: [] },
            { id: "application_scenario", label: "应用场景", questions: [] },
            { id: "requirement_details", label: "需求细节", questions: [] },
          ],
          canDraftNow: true,
        },
        citations: [],
        emptyKnowledge: true,
      })),
    };

    await generateRequirementDraft(
      { requirement: "需要一个能追踪审批状态的需求", knowledgeBaseIds: ["base-a", "base-b"], answerLanguage: "en" },
      provider
    );

    expect(mocks.selectKnowledgeSnippets).toHaveBeenCalledWith("需要一个能追踪审批状态的需求", {
      knowledgeBaseIds: ["base-a", "base-b"],
    });
    expect(provider.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        knowledgeBaseIds: ["base-a", "base-b"],
        answerLanguage: "en",
        maxDrafts: DEFAULT_MAX_DRAFTS,
      })
    );
  });
});
