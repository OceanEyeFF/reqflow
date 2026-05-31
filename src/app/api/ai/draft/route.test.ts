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
  buildHybridContextWindow: vi.fn(async (_query: string, options: { knowledgeBaseIds?: string[] } = {}) => ({
    contextText: "审批流程需要记录每个管理员确认步骤。",
    citations: [
      {
        sourceId: "kb-source-1",
        sourceTitle: "审批流程指南",
        path: "docs/business/approval.md",
        section: "审批状态追踪",
        snippet: "审批流程需要记录每个管理员确认步骤，并在工单中展示当前审批人。",
        freshness: "imported 2026-05-31T00:00:00.000Z v1",
      },
    ],
    citationGroups: [
      {
        sourceId: "kb-source-1",
        sourceTitle: "审批流程指南",
        path: "docs/business/approval.md",
        section: "审批状态追踪",
        snippetIds: ["snippet-approval-1"],
        snippets: ["审批流程需要记录每个管理员确认步骤，并在工单中展示当前审批人。"],
      },
    ],
    debugEvidence: createDebugEvidence(options.knowledgeBaseIds ?? []),
  })),
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
      searchEvidence: {
        vectorLane: { status: "failed", reason: "active-profile-missing" },
      },
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

  it("returns Chinese business draft with selected knowledge scope, citations, and safe search evidence", async () => {
    mockAuthSession(auth, { id: "user-1" });
    providerGenerate.mockImplementationOnce(async (request) => ({
      kind: "draft",
      result: {
        title: "审批状态追踪",
        background: "项目经理需要在需求工单里查看审批进度。",
        userStory: "作为项目经理，我要看到当前审批人和审批历史，以便推进需求。",
        acceptanceCriteria: ["展示当前审批人", "展示审批历史", "支持按知识库范围生成草稿"],
        pendingQuestions: ["是否需要审批超时提醒？"],
        suggestedPriority: "high",
        citations: request.knowledge.map((citation) => ({
          sourceId: citation.sourceId,
          sourceTitle: citation.sourceTitle,
          path: citation.path,
          section: citation.section,
          snippet: citation.snippet,
          freshness: citation.freshness,
        })),
      },
      citations: request.knowledge.map((citation) => ({
        sourceId: citation.sourceId,
        sourceTitle: citation.sourceTitle,
        path: citation.path,
        section: citation.section,
        snippet: citation.snippet,
        freshness: citation.freshness,
      })),
      emptyKnowledge: request.knowledge.length === 0,
    }));

    const response = await route.POST(
      jsonRequest("http://localhost/api/ai/draft", {
        mode: "draft",
        requirement: "项目经理需要用中文查看审批流程状态，并把结果带入需求工单。",
        knowledgeBaseIds: ["kb-approval"],
        answerLanguage: "zh",
        answers: [{ question: "谁使用？", answer: "项目经理" }],
      })
    );
    const result = await readJson<{
      kind: string;
      result: { citations: Array<{ path?: string; section?: string; freshness?: string }> };
      searchEvidence: { filters: { knowledgeBaseIds: string[] }; contextWindow: { includedCount: number } };
    }>(response);

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      kind: "draft",
      result: {
        citations: [
          {
            path: "docs/business/approval.md",
            section: "审批状态追踪",
            freshness: "imported 2026-05-31T00:00:00.000Z v1",
          },
        ],
      },
      searchEvidence: {
        filters: { knowledgeBaseIds: ["kb-approval"] },
        contextWindow: { includedCount: 1 },
      },
    });
    expect(providerGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "draft",
        answerLanguage: "zh",
        knowledgeBaseIds: ["kb-approval"],
        knowledge: [
          expect.objectContaining({
            sourceTitle: "审批流程指南",
            path: "docs/business/approval.md",
            section: "审批状态追踪",
          }),
        ],
      })
    );
    expect(JSON.stringify(result.body)).not.toMatch(/secret|apiKey|storageKey|DEEPSEEK_API_KEY/);
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

function createDebugEvidence(knowledgeBaseIds: string[] = []) {
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
    vectorLane: { status: "failed" as const, reason: "active-profile-missing", evidence: { apiKey: "secret" } },
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
        knowledgeBaseIds,
        sourceStatuses: ["ready", "enabled"],
        enabledOnly: true as const,
        versionStatuses: ["ready"],
      },
      candidatesScanned: 1,
      candidatesReturned: 1,
      cap: 3,
      lexicalHits: [
        {
          snippetId: "snippet-approval-1",
          sourceId: "kb-source-1",
          sourceTitle: "审批流程指南",
          path: "docs/business/approval.md",
          section: "审批状态追踪",
          rank: 1,
          engine: "postgres-native-fts-fallback" as const,
          score: 12,
          matchedTerms: ["审批", "流程"],
          mustTerms: ["审批", "流程"],
          mustTermsMatched: ["审批", "流程"],
          lexicalTextSource: "metadata" as const,
        },
      ],
    },
    vectorHits: [],
    fusedHits: [
      {
        snippetId: "snippet-approval-1",
        sourceId: "kb-source-1",
        sourceTitle: "审批流程指南",
        path: "docs/business/approval.md",
        section: "审批状态追踪",
        fusedRank: 1,
        fusedScore: 0.0164,
        lexicalRank: 1,
        lexicalScore: 12,
        rrf: { k: 60, lexicalContribution: 0.0164, vectorContribution: 0 },
      },
    ],
    contextWindow: {
      maxContextChars: 1600,
      adjacentChunks: 1,
      included: [
        {
          snippetId: "snippet-approval-1",
          sourceId: "kb-source-1",
          sourceTitle: "审批流程指南",
          path: "docs/business/approval.md",
          section: "审批状态追踪",
          chunkIndex: 0,
          reason: "selected-hit" as const,
          chars: 31,
        },
      ],
      dedupedSnippetIds: [],
      cappedSnippetIds: [],
      skippedSnippetIds: [],
    },
  };
}
