import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { auth as authFn } from "@/auth";
import { jsonRequest, mockAuthSession, mockNoSession, readJson } from "@/test/api-test-helpers";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  buildHybridContextWindow: vi.fn(async () => ({
    contextText: "context",
    citations: [
      {
        sourceId: "kb-source-1",
        sourceTitle: "Admin guide",
        path: "docs/admin.md",
        section: "审批",
        snippet: "审批流程需要记录每个管理员确认步骤。",
        freshness: "imported 2026-05-31T00:00:00.000Z v1",
      },
    ],
    citationGroups: [
      {
        sourceId: "kb-source-1",
        sourceTitle: "Admin guide",
        path: "docs/admin.md",
        section: "审批",
        snippetIds: ["snippet-1"],
        snippets: ["审批流程需要记录每个管理员确认步骤。"],
      },
    ],
    debugEvidence: createDebugEvidence(),
  })),
}));

vi.mock("@/lib/knowledge/retrieval", () => ({
  buildHybridContextWindow: mocks.buildHybridContextWindow,
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
  mocks.buildHybridContextWindow.mockClear();
});

describe("POST /api/admin/knowledge/search", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/search", { query: "审批流程" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
    expect(mocks.buildHybridContextWindow).not.toHaveBeenCalled();
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/search", { query: "审批流程" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
    expect(mocks.buildHybridContextWindow).not.toHaveBeenCalled();
  });

  it("rejects weak query input", async () => {
    mockAuthSession(auth, { id: "admin-1", role: "admin" });

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/search", { query: "a" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "检索问题太短" } });
    expect(mocks.buildHybridContextWindow).not.toHaveBeenCalled();
  });

  it("returns safe retrieval evidence for admins", async () => {
    mockAuthSession(auth, { id: "admin-1", role: "admin" });

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/search", {
        query: " 审批流程 ",
        knowledgeBaseIds: [" base-a ", "base-a", "base-b", ""],
      })
    );
    const result = await readJson<{
      citations: unknown[];
      citationGroups: Array<{ snippetCount: number }>;
      searchEvidence: { filters: { knowledgeBaseIds: string[] }; vectorLane: { status: string; reason?: string } };
    }>(response);

    expect(result.status).toBe(200);
    expect(mocks.buildHybridContextWindow).toHaveBeenCalledWith("审批流程", {
      knowledgeBaseIds: ["base-a", "base-b"],
      maxContextChars: 1600,
      adjacentChunks: 1,
    });
    expect(result.body.citations).toHaveLength(1);
    expect(result.body.citationGroups[0]).toMatchObject({ snippetCount: 1 });
    expect(result.body.searchEvidence.filters.knowledgeBaseIds).toEqual(["base-a"]);
    expect(result.body.searchEvidence.vectorLane).toEqual({ status: "failed", reason: "active-profile-missing" });
    expect(result.body.searchEvidence).toMatchObject({
      coverageDiagnostics: {
        selectedKnowledgeBaseIds: ["base-a"],
        citationCount: 1,
        matchedCoreTerms: ["审批", "流程"],
        missingCoreTerms: [],
        vectorLaneStatus: { status: "failed", reason: "active-profile-missing" },
        lexicalEngine: "postgres-native-fts-fallback",
        lexicalCandidatesScanned: 1,
        lexicalCandidatesReturned: 1,
      },
    });
    expect(JSON.stringify(result.body)).not.toMatch(/secret|apiKey|storageKey|private\/admin\.md/);
  });

  it("returns Chinese E2E debug evidence aligned with selected knowledge scope and citation provenance", async () => {
    mockAuthSession(auth, { id: "admin-1", role: "admin" });

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/search", {
        query: "项目经理查看审批流程状态",
        knowledgeBaseIds: ["kb-approval"],
      })
    );
    const result = await readJson<{
      citations: Array<{ sourceTitle: string; path?: string; section?: string; snippet: string }>;
      citationGroups: Array<{ path: string; section?: string; snippetCount: number }>;
      searchEvidence: {
        query: { mustTerms: string[] };
        filters: { knowledgeBaseIds: string[] };
        lexical: { candidatesReturned: number; hits: Array<{ path: string; section?: string; matchedTerms: string[] }> };
        fusion: { hits: Array<{ fusedRank: number; lexicalRank?: number }> };
        contextWindow: { includedCount: number; included: Array<{ reason: string; path: string }> };
      };
    }>(response);

    expect(result.status).toBe(200);
    expect(result.body.citations[0]).toMatchObject({
      sourceTitle: "Admin guide",
      path: "docs/admin.md",
      section: "审批",
      snippet: "审批流程需要记录每个管理员确认步骤。",
    });
    expect(result.body.citationGroups[0]).toMatchObject({
      path: "docs/admin.md",
      section: "审批",
      snippetCount: 1,
    });
    expect(result.body.searchEvidence).toMatchObject({
      filters: { knowledgeBaseIds: ["base-a"] },
      lexical: {
        candidatesReturned: 1,
        hits: [
          {
            path: "docs/admin.md",
            section: "审批",
            matchedTerms: ["审批", "流程"],
          },
        ],
      },
      fusion: { hits: [{ fusedRank: 1, lexicalRank: 1 }] },
      contextWindow: { includedCount: 1, included: [{ reason: "selected-hit", path: "docs/admin.md" }] },
    });
    expect(JSON.stringify(result.body)).not.toMatch(/secret|apiKey|storageKey|private\/admin\.md/);
  });
});

function createDebugEvidence() {
  return {
    query: {
      rawQuery: "审批流程",
      normalizedQuery: "审批流程",
      lexicalQuery: "审批 流程",
      embeddingQuery: "审批流程",
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
        rawQuery: "审批流程",
        normalizedQuery: "审批流程",
        lexicalQuery: "审批 流程",
        embeddingQuery: "审批流程",
        mustTerms: ["审批", "流程"],
        domainEntities: ["审批流程"],
      },
      engine: "postgres-native-fts-fallback" as const,
      filters: {
        knowledgeBaseIds: ["base-a"],
        sourceStatuses: ["ready", "enabled"],
        enabledOnly: true as const,
        versionStatuses: ["ready"],
      },
      candidatesScanned: 1,
      candidatesReturned: 1,
      cap: 3,
      lexicalHits: [
        {
          snippetId: "snippet-1",
          sourceId: "kb-source-1",
          sourceTitle: "Admin guide",
          path: "docs/admin.md",
          section: "审批",
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
        snippetId: "snippet-1",
        sourceId: "kb-source-1",
        sourceTitle: "Admin guide",
        path: "docs/admin.md",
        section: "审批",
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
          snippetId: "snippet-1",
          sourceId: "kb-source-1",
          sourceTitle: "Admin guide",
          path: "docs/admin.md",
          section: "审批",
          chunkIndex: 0,
          reason: "selected-hit" as const,
          chars: 18,
        },
      ],
      dedupedSnippetIds: [],
      cappedSnippetIds: [],
      skippedSnippetIds: [],
    },
  };
}
