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
      provider.generate({
        mode: "draft",
        requirement: "需要审批流",
        answers: [],
        knowledgeBaseIds: [],
        answerLanguage: "follow_input",
        maxDrafts: 3,
        knowledge: [],
      })
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
      maxDrafts: 3,
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
    expect(body.messages[1].content).toContain('"maxDrafts":3');
    expect(body.messages[1].content).toContain("draft or drafts");
    expect(result).toMatchObject({
      kind: "draft",
      result: { title: "审批流", suggestedPriority: "high" },
      emptyKnowledge: false,
    });
  });

  it("normalizes nested multi-draft responses and copies citations into each draft", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  kind: "drafts",
                  result: {
                    drafts: [
                      { title: "审批状态", suggestedPriority: "urgent", acceptanceCriteria: ["展示状态"] },
                      { title: "审批通知", suggestedPriority: "invalid", acceptanceCriteria: ["通知审批人"] },
                    ],
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
      mode: "draft",
      requirement: "需要拆成审批状态和通知",
      answers: [],
      knowledgeBaseIds: [],
      answerLanguage: "follow_input",
      maxDrafts: 3,
      knowledge: [
        {
          sourceId: "source-1",
          sourceTitle: "流程说明",
          path: "docs/process.md",
          snippet: "审批流程需要可追踪。",
          freshness: "test",
        },
      ],
    });

    expect(result).toMatchObject({
      kind: "drafts",
      result: {
        drafts: [
          { title: "审批状态", suggestedPriority: "urgent", citations: [{ sourceId: "source-1" }] },
          { title: "审批通知", suggestedPriority: "medium", citations: [{ sourceId: "source-1" }] },
        ],
      },
      emptyKnowledge: false,
    });
  });

  it("normalizes multi-draft responses and caps them by maxDrafts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  kind: "drafts",
                  drafts: [
                    { title: "审批状态", suggestedPriority: "high", acceptanceCriteria: ["展示审批状态"] },
                    { title: "审批通知", suggestedPriority: "medium", acceptanceCriteria: ["通知审批人"] },
                    { title: "审批报表", suggestedPriority: "low", acceptanceCriteria: ["统计审批耗时"] },
                  ],
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
      mode: "draft",
      requirement: "需要拆成审批状态、通知和报表",
      answers: [],
      knowledgeBaseIds: [],
      answerLanguage: "follow_input",
      maxDrafts: 2,
      knowledge: [],
    });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(body.messages[1].content).toContain('"maxDrafts":2');
    expect(result).toMatchObject({
      kind: "drafts",
      result: {
        drafts: [
          { title: "审批状态", suggestedPriority: "high", acceptanceCriteria: ["展示审批状态"] },
          { title: "审批通知", suggestedPriority: "medium", acceptanceCriteria: ["通知审批人"] },
        ],
      },
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
      maxDrafts: 3,
      knowledge: [],
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:1234/v1/chat/completions",
      expect.objectContaining({
        headers: expect.not.objectContaining({ authorization: expect.any(String) }),
      })
    );
  });

  it("adds visible fallback clarification questions when the provider returns empty directions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [{ message: { content: JSON.stringify({ kind: "clarification", questions: [] }) } }],
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
      answerLanguage: "zh",
      maxDrafts: 3,
      knowledge: [],
    });

    expect(result).toMatchObject({
      kind: "clarification",
      result: {
        directions: [
          { id: "knowledge_basis", questions: [{ id: "knowledge_basis-fallback-1" }] },
          { id: "application_scenario", questions: [{ id: "application_scenario-fallback-1" }] },
          { id: "requirement_details", questions: [{ id: "requirement_details-fallback-1" }] },
        ],
      },
    });
    if (result.kind === "clarification") {
      expect(result.result.questions).toHaveLength(3);
    }
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
      maxDrafts: 3,
      knowledge: [],
    });

    expect(result).toMatchObject({
      kind: "clarification",
      result: {
        questions: [{ id: "q1", question: "目标用户是谁？", reason: "确认使用场景" }],
        directions: [
          { id: "knowledge_basis", label: "知识库依据", questions: [] },
          { id: "application_scenario", label: "应用场景", questions: [] },
          {
            id: "requirement_details",
            label: "需求细节",
            questions: [{ id: "q1", question: "目标用户是谁？", reason: "确认使用场景" }],
          },
        ],
        canDraftNow: false,
      },
    });
  });

  it("normalizes fixed clarification directions and caps each direction", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  kind: "clarification",
                  directions: [
                    {
                      id: "knowledge_basis",
                      label: "知识库依据",
                      questions: Array.from({ length: 6 }, (_, index) => ({
                        question: `依据问题 ${index + 1}`,
                        reason: "确认知识来源",
                      })),
                    },
                    {
                      id: "application_scenario",
                      label: "应用场景",
                      questions: [{ question: "谁在什么场景使用？", reason: "确认场景" }],
                    },
                    {
                      id: "requirement_details",
                      label: "需求细节",
                      questions: [{ question: "成功标准是什么？", reason: "确认细节" }],
                    },
                  ],
                  canDraftNow: false,
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
      answerLanguage: "zh",
      maxDrafts: 3,
      knowledge: [],
    });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(body.messages[1].content).toContain("知识库依据");
    expect(body.messages[1].content).toContain("应用场景");
    expect(body.messages[1].content).toContain("需求细节");
    expect(body.messages[1].content).toContain("at most five questions for each direction");
    expect(result.kind).toBe("clarification");
    if (result.kind === "clarification") {
      expect(result.result.directions).toHaveLength(3);
      expect(result.result.directions[0].questions).toHaveLength(5);
      expect(result.result.questions).toHaveLength(7);
    }
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
      provider.generate({
        mode: "draft",
        requirement: "需要审批流",
        answers: [],
        knowledgeBaseIds: [],
        answerLanguage: "follow_input",
        maxDrafts: 3,
        knowledge: [],
      })
    ).rejects.toBeInstanceOf(AiProviderError);
  });
});
