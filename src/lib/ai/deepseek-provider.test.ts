import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AiProviderConfigError,
  AiProviderError,
  createDeepseekProvider,
  getDeepseekConfig,
} from "./deepseek-provider";

describe("getDeepseekConfig", () => {
  it("uses server-side defaults and env overrides", () => {
    expect(
      getDeepseekConfig({
        DEEPSEEK_API_KEY: "test-key",
        DEEPSEEK_BASE_URL: "https://example.test",
        DEEPSEEK_MODEL: "custom-model",
        DEEPSEEK_TIMEOUT_MS: "123",
      })
    ).toEqual({
      apiKey: "test-key",
      baseUrl: "https://example.test",
      model: "custom-model",
      timeoutMs: 123,
    });
  });
});

describe("createDeepseekProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fails fast when api key is missing", async () => {
    const provider = createDeepseekProvider({
      baseUrl: "https://example.test",
      model: "deepseek-v4-flash",
      timeoutMs: 1000,
    });

    await expect(
      provider.generate({ mode: "draft", requirement: "需要审批流", answers: [], knowledgeBaseIds: [], answerLanguage: "follow_input", knowledge: [] })
    ).rejects.toBeInstanceOf(AiProviderConfigError);
  });

  it("normalizes a JSON draft response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  kind: "draft",
                  title: "审批流",
                  background: "需要追踪审批",
                  userStory: "作为项目经理，我要看到审批状态",
                  acceptanceCriteria: ["能看到状态"],
                  pendingQuestions: ["谁审批？"],
                  suggestedPriority: "high",
                }),
              },
            },
          ],
        })
      )
    );

    const provider = createDeepseekProvider({
      apiKey: "test-key",
      baseUrl: "https://example.test/",
      model: "deepseek-v4-flash",
      timeoutMs: 1000,
    });
    const result = await provider.generate({
      mode: "draft",
      requirement: "需要审批流",
      answers: [],
      knowledgeBaseIds: [],
      answerLanguage: "zh",
      knowledge: [
        {
          sourceId: "rf-ai-mvp-boundary",
          sourceTitle: "AI MVP technical boundary",
          path: "docs/ai-mvp-technical-brief.md",
          snippet: "AI output is advisory.",
          freshness: "test",
        },
      ],
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://example.test/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer test-key" }),
      })
    );
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(body.messages[1].content).toContain("Respond in Chinese.");
    expect(result).toMatchObject({
      kind: "draft",
      result: { title: "审批流", suggestedPriority: "high" },
      emptyKnowledge: false,
    });
  });

  it("allows localhost no-key providers without authorization header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [{ message: { content: JSON.stringify({ kind: "clarification", questions: [] }) } }],
        })
      )
    );

    const provider = createDeepseekProvider({
      baseUrl: "http://localhost:1234/v1",
      model: "local-model",
      timeoutMs: 1000,
    });

    await provider.generate({
      mode: "clarify",
      requirement: "需要审批流",
      answers: [],
      knowledgeBaseIds: [],
      answerLanguage: "follow_input",
      knowledge: [],
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:1234/v1/chat/completions",
      expect.objectContaining({
        headers: expect.not.objectContaining({ authorization: expect.any(String) }),
      })
    );
  });

  it("normalizes nested clarification questions returned by OpenAI-compatible providers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  kind: "clarification",
                  result: {
                    questions: [{ question: "目标用户是谁？", reason: "确认使用场景" }],
                    canDraftNow: false,
                  },
                }),
              },
            },
          ],
        })
      )
    );

    const provider = createDeepseekProvider({
      apiKey: "test-key",
      baseUrl: "https://example.test",
      model: "deepseek-v4-flash",
      timeoutMs: 1000,
    });

    const result = await provider.generate({
      mode: "clarify",
      requirement: "需要审批流",
      answers: [],
      knowledgeBaseIds: [],
      answerLanguage: "en",
      knowledge: [],
    });

    expect(result).toMatchObject({
      kind: "clarification",
      result: {
        questions: [{ id: "q1", question: "目标用户是谁？", reason: "确认使用场景" }],
        canDraftNow: false,
      },
    });
  });

  it("wraps provider failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 500 })));
    const provider = createDeepseekProvider({
      apiKey: "test-key",
      baseUrl: "https://example.test",
      model: "deepseek-v4-flash",
      timeoutMs: 1000,
    });

    await expect(
      provider.generate({ mode: "draft", requirement: "需要审批流", answers: [], knowledgeBaseIds: [], answerLanguage: "follow_input", knowledge: [] })
    ).rejects.toBeInstanceOf(AiProviderError);
  });
});
