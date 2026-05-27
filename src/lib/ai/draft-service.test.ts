import { describe, expect, it, vi } from "vitest";
import { generateRequirementDraft, parseDraftRequest } from "./draft-service";
import type { DraftProvider } from "./types";

vi.mock("@/lib/knowledge/retrieval", () => ({
  selectKnowledgeSnippets: vi.fn(async () => []),
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
    });
  });
});

describe("generateRequirementDraft", () => {
  it("redacts sensitive input before provider calls and supports empty knowledge fallback", async () => {
    const provider: DraftProvider = {
      generate: vi.fn(async (request) => ({
        kind: "clarification",
        result: { questions: [{ id: "q1", question: "谁审批？", reason: "确认流程" }], canDraftNow: false },
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
      })
    );
    expect(JSON.stringify(vi.mocked(provider.generate).mock.calls)).not.toContain("real-secret");
    expect(result.kind).toBe("clarification");
  });
});
