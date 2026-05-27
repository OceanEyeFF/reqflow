import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { auth as authFn } from "@/auth";
import { jsonRequest, mockAuthSession, mockNoSession, readJson } from "@/test/api-test-helpers";
import { AiProviderConfigError, AiProviderError } from "@/lib/ai/deepseek-provider";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const providerGenerate = vi.fn();

vi.mock("@/lib/ai/deepseek-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/deepseek-provider")>();
  return {
    ...actual,
    createDeepseekProvider: () => ({ generate: providerGenerate }),
  };
});

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

  it("returns mocked clarification result without creating a ticket", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockResolvedValue({
      kind: "clarification",
      result: { questions: [{ id: "q1", question: "谁审批？", reason: "确认角色" }], canDraftNow: false },
      citations: [],
      emptyKnowledge: true,
    });

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", {
        mode: "clarify",
        requirement: "需要一个审批流程，可以追踪每一步状态",
      })
    );
    const result = await readJson<{ kind: string; emptyKnowledge: boolean }>(response);

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ kind: "clarification", emptyKnowledge: true });
    expect(providerGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "clarify",
        knowledge: expect.any(Array),
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
