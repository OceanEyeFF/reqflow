import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { auth as authFn } from "@/auth";
import { jsonRequest, mockAuthSession, mockNoSession, readJson } from "@/test/api-test-helpers";
import { AiProviderConfigError, AiProviderError } from "@/lib/ai/deepseek-provider";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const providerGenerate = vi.fn();
const getEffectiveProviderConfig = vi.fn();
let lastProviderConfig: unknown;

vi.mock("@/lib/ai/deepseek-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/deepseek-provider")>();
  return {
    ...actual,
    createDeepseekProvider: (config: unknown) => {
      lastProviderConfig = config;
      return { generate: providerGenerate };
    },
  };
});

vi.mock("@/lib/ai/provider-config", () => ({
  getEffectiveProviderConfig,
}));

vi.mock("@/lib/knowledge/retrieval", () => ({
  selectKnowledgeSnippets: vi.fn(async () => []),
}));

type Route = typeof import("./route");

let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: Route;

beforeAll(async () => {
  vi.resetModules();
  const authModule = await import("@/auth");
  auth = vi.mocked(authModule.auth);
  route = await import("./route");
});

beforeEach(() => {
  auth.mockReset();
  providerGenerate.mockReset();
  lastProviderConfig = undefined;
  getEffectiveProviderConfig.mockReset();
  getEffectiveProviderConfig.mockResolvedValue({
    apiKey: "test-key",
    baseUrl: "https://api.example.test",
    model: "model-x",
    timeoutMs: 1000,
  });
});

describe("POST /api/ai/draft", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", { requirement: "需要一个审批流程" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
    expect(providerGenerate).not.toHaveBeenCalled();
  });

  it("rejects weak input", async () => {
    mockAuthSession(auth, { id: "user-1" });

    const response = await route.POST(jsonRequest("http://localhost/api/ai/draft", { requirement: "短" }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "需求描述太短" } });
    expect(providerGenerate).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON as a bad request", async () => {
    mockAuthSession(auth, { id: "user-1" });

    const response = await route.POST(
      new Request("http://localhost/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{bad-json",
      })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "请求 JSON 格式不正确" } });
    expect(providerGenerate).not.toHaveBeenCalled();
  });

  it("returns mocked clarification result without creating a ticket", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockResolvedValue({
      kind: "clarification",
      result: {
        questions: [{ id: "q1", question: "谁审批？", reason: "确认角色" }],
        directions: [
          { id: "knowledge_basis", label: "知识库依据", questions: [] },
          { id: "application_scenario", label: "应用场景", questions: [] },
          { id: "requirement_details", label: "需求细节", questions: [{ id: "q1", question: "谁审批？", reason: "确认角色" }] },
        ],
        canDraftNow: false,
      },
      citations: [],
      emptyKnowledge: true,
    });

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", {
        mode: "clarify",
        requirement: "需要一个审批流程，可以追踪每一步状态",
        knowledgeBaseIds: ["base-a"],
        answerLanguage: "zh",
      })
    );
    const result = await readJson<{ kind: string; result: { directions: unknown[] }; emptyKnowledge: boolean }>(response);

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      kind: "clarification",
      emptyKnowledge: true,
      result: { directions: [{ label: "知识库依据" }, { label: "应用场景" }, { label: "需求细节" }] },
    });
    expect(providerGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "clarify",
        knowledgeBaseIds: ["base-a"],
        answerLanguage: "zh",
        maxDrafts: 3,
        knowledge: expect.any(Array),
      })
    );
    expect(lastProviderConfig).toMatchObject({ model: "model-x" });
  });

  it("returns multi-draft results unchanged without creating a ticket", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockResolvedValue({
      kind: "drafts",
      result: {
        drafts: [
          {
            title: "审批状态",
            background: "需要追踪状态",
            userStory: "作为项目经理，我要看到审批状态",
            acceptanceCriteria: ["展示审批状态"],
            pendingQuestions: [],
            suggestedPriority: "high",
            citations: [],
          },
          {
            title: "审批通知",
            background: "需要通知审批人",
            userStory: "作为审批人，我要收到待办提醒",
            acceptanceCriteria: ["通知审批人"],
            pendingQuestions: [],
            suggestedPriority: "medium",
            citations: [],
          },
        ],
      },
      citations: [],
      emptyKnowledge: true,
    });

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", {
        mode: "draft",
        requirement: "需要一个审批流程，可以拆分状态追踪和审批通知",
      })
    );
    const result = await readJson<{ kind: string; result: { drafts: unknown[] } }>(response);

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      kind: "drafts",
      result: { drafts: [{ title: "审批状态" }, { title: "审批通知" }] },
    });
    expect(providerGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "draft",
        maxDrafts: 3,
      })
    );
  });

  it("returns provider configuration errors without leaking secrets", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockRejectedValue(new AiProviderConfigError("DEEPSEEK_API_KEY=secret"));

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", { requirement: "需要一个审批流程" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 503, body: { error: "AI provider is not configured" } });
    expect(JSON.stringify(result.body)).not.toContain("secret");
  });

  it("returns provider failures as gateway errors", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockRejectedValue(new AiProviderError("bad provider response"));

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", { requirement: "需要一个审批流程" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 502, body: { error: "AI provider request failed" } });
  });
});
