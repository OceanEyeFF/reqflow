import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ACTIVE_LEXICAL_ENGINE,
  TARGET_BM25_LEXICAL_ENGINE,
  isRuntimeClaimAllowed,
} from "./lexical-engines";
import { createHttpEmbeddingProviderFromConfig } from "./embedding-http-provider";

import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  seedUser,
} from "@/test/api-test-helpers";

const mocks = vi.hoisted(() => ({
  deletePrivateKnowledgeFile: vi.fn(),
}));

vi.mock("./private-storage", () => ({
  deletePrivateKnowledgeFile: mocks.deletePrivateKnowledgeFile,
}));

let prisma: PrismaClient;
let deleteKnowledgeSource: typeof import("./cleanup").deleteKnowledgeSource;
let clearKnowledgeSources: typeof import("./cleanup").clearKnowledgeSources;
let selectKnowledgeSnippets: typeof import("./retrieval").selectKnowledgeSnippets;
let retrieveKnowledgeSnippets: typeof import("./retrieval").retrieveKnowledgeSnippets;
let retrieveHybridKnowledgeSnippets: typeof import("./retrieval").retrieveHybridKnowledgeSnippets;
let buildHybridContextWindow: typeof import("./retrieval").buildHybridContextWindow;
let understandKnowledgeQuery: typeof import("./retrieval").understandKnowledgeQuery;
let tokenize: typeof import("./retrieval").tokenize;
let generateKnowledgeSnippetEmbedding: typeof import("./embeddings").generateKnowledgeSnippetEmbedding;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("knowledge-retrieval");
  const helpers = await import("@/test/api-test-helpers");
  helpers.pushTestDatabaseSchema(process.env.DATABASE_URL);
  const prismaModule = await import("@/lib/prisma");
  prisma = prismaModule.prisma;
  const retrievalModule = await import("./retrieval");
  const cleanupModule = await import("./cleanup");
  deleteKnowledgeSource = cleanupModule.deleteKnowledgeSource;
  clearKnowledgeSources = cleanupModule.clearKnowledgeSources;
  selectKnowledgeSnippets = retrievalModule.selectKnowledgeSnippets;
  retrieveKnowledgeSnippets = retrievalModule.retrieveKnowledgeSnippets;
  retrieveHybridKnowledgeSnippets = retrievalModule.retrieveHybridKnowledgeSnippets;
  buildHybridContextWindow = retrievalModule.buildHybridContextWindow;
  understandKnowledgeQuery = retrievalModule.understandKnowledgeQuery;
  tokenize = retrievalModule.tokenize;
  const embeddingsModule = await import("./embeddings");
  generateKnowledgeSnippetEmbedding = embeddingsModule.generateKnowledgeSnippetEmbedding;

  return async () => {
    await disconnectPrisma(prisma);
    helpers.removeTestDatabase(process.env.DATABASE_URL);
  };
});

beforeEach(async () => {
  mocks.deletePrivateKnowledgeFile.mockReset();
  await clearDatabase(prisma);
});

describe("tokenize", () => {
  it("deduplicates meaningful terms", () => {
    expect(tokenize("审批 审批 flow a")).toEqual(["审批", "flow"]);
  });

  it("segments Chinese business terms for native FTS fallback", () => {
    expect(tokenize("管理员审批流程")).toEqual(
      expect.arrayContaining(["管理员审批流程", "管理", "审批", "流程", "管理员", "审批流程"])
    );
  });
});

describe("understandKnowledgeQuery", () => {
  it("returns deterministic query understanding fields", () => {
    expect(understandKnowledgeQuery(" 管理员审批流程 ")).toMatchObject({
      rawQuery: " 管理员审批流程 ",
      normalizedQuery: "管理员审批流程",
      lexicalQuery: expect.stringContaining("审批"),
      embeddingQuery: "管理员审批流程",
      mustTerms: expect.arrayContaining(["管理员审批流程", "审批", "流程"]),
      domainEntities: expect.arrayContaining(["审批", "流程"]),
    });
  });
});

describe("selectKnowledgeSnippets", () => {
  it("selects enabled ready snippets as citations", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    const citations = await selectKnowledgeSnippets("管理员 审批 流程");

    expect(citations).toHaveLength(1);
    expect(citations[0]).toMatchObject({
      sourceTitle: "Admin guide",
      path: "docs/admin.md",
      snippet: "审批流程需要记录每个管理员确认步骤。",
    });
    expect(citations[0].sourceId).toMatch(/^kb-/);
  });

  it("uses search metadata lexical text and returns debug evidence", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "正文只说项目配置。",
      searchMetadata: {
        lexicalText: "管理员 审批 流程 确认",
        documentTitle: "管理员审批流程",
        domainEntities: ["管理员"],
        processNames: ["审批流程"],
        materialTypes: ["操作指南"],
        approvalActions: ["确认"],
        applicabilityRules: ["后台管理"],
      },
    });

    const result = await retrieveKnowledgeSnippets("管理员审批流程", {
      knowledgeBaseIds: [source.knowledgeBaseId],
    });

    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]).toMatchObject({
      sourceTitle: "Admin guide",
      snippet: "正文只说项目配置。",
    });
    expect(result.debugEvidence).toMatchObject({
      engine: "postgres-native-fts-fallback",
      filters: {
        knowledgeBaseIds: [source.knowledgeBaseId],
        enabledOnly: true,
      },
      candidatesReturned: 1,
      lexicalHits: [
        expect.objectContaining({
          sourceId: `kb-${source.id}`,
          lexicalTextSource: "metadata",
          engine: "postgres-native-fts-fallback",
          matchedTerms: expect.arrayContaining(["审批", "流程"]),
          mustTermsMatched: expect.arrayContaining(["审批", "流程"]),
        }),
      ],
    });
  });

  it("does not claim BM25 evidence on the native fallback path", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    const result = await retrieveKnowledgeSnippets("审批流程");

    expect(result.debugEvidence.engine).toBe(ACTIVE_LEXICAL_ENGINE.id);
    expect(ACTIVE_LEXICAL_ENGINE.bm25).toBe(false);
    expect(isRuntimeClaimAllowed(TARGET_BM25_LEXICAL_ENGINE.id)).toBe(false);
    expect(result.debugEvidence.lexicalHits.every((hit) => hit.engine === ACTIVE_LEXICAL_ENGINE.id)).toBe(true);
  });

  it("uses database-side lexical recall beyond the previous newest candidate window", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const relevant = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "老文档说明特殊采购审批路径。",
    });
    for (let index = 0; index < 105; index += 1) {
      await seedSnippet(admin.id, {
        sourceEnabled: true,
        sourceStatus: "ready",
        versionStatus: "ready",
        snippetEnabled: true,
        content: `近期噪声片段 ${index}`,
      });
    }

    const result = await retrieveKnowledgeSnippets("特殊采购审批", {
      knowledgeBaseIds: [relevant.knowledgeBaseId],
    });

    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].snippet).toBe("老文档说明特殊采购审批路径。");
    expect(result.debugEvidence.candidatesScanned).toBe(1);
    expect(result.debugEvidence.lexicalHits[0]).toMatchObject({
      engine: "postgres-native-fts-fallback",
      matchedTerms: expect.arrayContaining(["特殊", "采购", "审批"]),
    });
  });

  it("excludes disabled sources and snippets", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: false,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程",
    });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: false,
      content: "管理员流程",
    });

    await expect(selectKnowledgeSnippets("审批 管理员")).resolves.toEqual([]);
  });

  it("excludes snippets from disabled knowledge bases", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      baseEnabled: false,
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    await expect(selectKnowledgeSnippets("审批 管理员")).resolves.toEqual([]);
  });

  it("limits snippets to selected knowledge bases", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const selected = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程来自选中知识库。",
    });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程来自未选知识库。",
    });

    const citations = await selectKnowledgeSnippets("审批 流程", {
      knowledgeBaseIds: [selected.knowledgeBaseId],
    });

    expect(citations).toHaveLength(1);
    expect(citations[0].snippet).toBe("审批流程来自选中知识库。");
  });

  it("does not return snippets from disabled selected knowledge bases", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      baseEnabled: false,
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程来自停用知识库。",
    });

    await expect(selectKnowledgeSnippets("审批 流程", { knowledgeBaseIds: [source.knowledgeBaseId] })).resolves.toEqual([]);
  });

  it("excludes snippets after source deletion", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    await expect(selectKnowledgeSnippets("管理员 审批 流程")).resolves.toHaveLength(1);
    await deleteKnowledgeSource(source.id);

    await expect(selectKnowledgeSnippets("管理员 审批 流程")).resolves.toEqual([]);
  });

  it("excludes snippets after full knowledge clear", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    await clearKnowledgeSources();

    await expect(selectKnowledgeSnippets("管理员 审批 流程")).resolves.toEqual([]);
  });
});

describe("retrieveHybridKnowledgeSnippets", () => {
  it("fuses lexical and vector overlap with RRF evidence without raw score addition", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "正文只说配置。",
      searchMetadata: {
        lexicalText: "管理员 审批 流程 确认",
        documentTitle: "管理员审批流程",
        domainEntities: ["管理员"],
        processNames: ["审批流程"],
        materialTypes: ["操作指南"],
        approvalActions: ["确认"],
        applicabilityRules: ["后台管理"],
      },
    });
    await seedSearchProfile();
    const snippetId = await findOnlySnippetId();
    await generateKnowledgeSnippetEmbedding(snippetId);

    const result = await retrieveHybridKnowledgeSnippets("管理员审批流程", {
      knowledgeBaseIds: [source.knowledgeBaseId],
    });

    expect(result.citations).toHaveLength(1);
    expect(result.debugEvidence).toMatchObject({
      mode: "hybrid-rrf",
      fusion: {
        algorithm: "reciprocal-rank-fusion",
        rawScoreAddition: false,
      },
      vectorLane: { status: "ready", candidatesReturned: 1 },
      reranker: { name: "none", ran: false },
      fusedHits: [
        expect.objectContaining({
          snippetId,
          lexicalRank: 1,
          vectorRank: 1,
          fusedRank: 1,
          rrf: expect.objectContaining({
            lexicalContribution: expect.any(Number),
            vectorContribution: expect.any(Number),
          }),
        }),
      ],
    });
    const hit = result.debugEvidence.fusedHits[0];
    expect(hit.fusedScore).toBeCloseTo(hit.rrf.lexicalContribution + hit.rrf.vectorContribution);
    expect(hit.fusedScore).not.toBe((hit.lexicalScore ?? 0) + (hit.vectorScore ?? 0));
  });

  it("returns vector-only fused hits when lexical matching misses", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "正文只说配置。",
      searchMetadata: {
        lexicalText: "完全不同的词条",
        documentTitle: "无关文档",
        domainEntities: [],
        processNames: [],
        materialTypes: [],
        approvalActions: [],
        applicabilityRules: [],
      },
    });
    await seedSearchProfile();
    const snippetId = await findOnlySnippetId();
    await generateKnowledgeSnippetEmbedding(snippetId);

    const result = await retrieveHybridKnowledgeSnippets("采购预算模板", {
      knowledgeBaseIds: [source.knowledgeBaseId],
    });

    expect(result.debugEvidence.lexicalEvidence.lexicalHits).toHaveLength(0);
    expect(result.debugEvidence.fusedHits[0]).toMatchObject({
      snippetId,
      vectorRank: 1,
    });
    expect(result.debugEvidence.fusedHits[0].lexicalRank).toBeUndefined();
  });

  it("degrades to lexical-only evidence when vector retrieval fails", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    const result = await retrieveHybridKnowledgeSnippets("管理员 审批 流程");

    expect(result.citations).toHaveLength(1);
    expect(result.debugEvidence.vectorLane).toMatchObject({
      status: "failed",
      reason: "active-profile-missing",
    });
    expect(result.debugEvidence.fusedHits[0]).toMatchObject({
      lexicalRank: 1,
      rrf: expect.objectContaining({ vectorContribution: 0 }),
    });
    expect(result.debugEvidence.fusedHits[0].vectorRank).toBeUndefined();
  });

  it("degrades to lexical-only evidence when vector retrieval throws", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });
    await seedSearchProfile();

    const result = await retrieveHybridKnowledgeSnippets("管理员 审批 流程", {
      vectorProvider: {
        name: "deterministic-test",
        async embed() {
          throw new Error("provider offline");
        },
      },
    });

    expect(result.citations).toHaveLength(1);
    expect(result.debugEvidence.vectorLane).toMatchObject({
      status: "failed",
      reason: "provider-unavailable",
      evidence: { provider: "deterministic-test", model: "fake-embedding-v1", expectedDimensions: 3 },
    });
    expect(result.debugEvidence.fusedHits[0]).toMatchObject({
      lexicalRank: 1,
      rrf: expect.objectContaining({ vectorContribution: 0 }),
    });
  });

  it("keeps the local HTTP sidecar indexing path explicit from provider config through hybrid evidence", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const source = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "一般耗材检验合格后才允许出库。",
      searchMetadata: {
        lexicalText: "一般耗材 标准检验 检验合格 出库",
        documentTitle: "一般耗材标准检验出库",
        domainEntities: ["一般耗材"],
        processNames: ["标准检验出库"],
        materialTypes: ["耗材"],
        approvalActions: ["检验合格"],
        applicabilityRules: ["合格后出库"],
      },
    });
    const providerConfig = await seedEmbeddingProviderConfig(admin.id, {
      provider: "local-cpu-sidecar",
      model: "local-e5-small",
      dimensions: 3,
    });
    const profile = await seedSearchProfile({
      provider: "local-cpu-sidecar",
      model: "local-e5-small",
      dimensions: 3,
      providerConfigId: providerConfig.id,
    });
    const fetchImpl = vi.fn(async () => jsonResponse([[0.2, 0.4, 0.6]]));
    const sidecarProvider = createHttpEmbeddingProviderFromConfig(
      {
        provider: providerConfig.provider,
        baseUrl: providerConfig.baseUrl,
        apiKey: providerConfig.apiKey,
        noKeyMode: providerConfig.noKeyMode,
      },
      { path: "/embed", requestFormat: "tei", fetchImpl }
    );
    const snippetId = await findOnlySnippetId();

    const defaultProviderResult = await retrieveHybridKnowledgeSnippets("一般耗材标准检验出库", {
      knowledgeBaseIds: [source.knowledgeBaseId],
    });
    expect(defaultProviderResult.debugEvidence.vectorLane).toMatchObject({
      status: "failed",
      reason: "provider-unavailable",
    });

    await expect(generateKnowledgeSnippetEmbedding(snippetId, sidecarProvider)).resolves.toMatchObject({
      status: "ready",
      snippetId,
      profileId: profile.id,
      provider: "local-cpu-sidecar",
      model: "local-e5-small",
      dimensions: 3,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/embed"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ inputs: "一般耗材 标准检验 检验合格 出库" }),
      })
    );

    const result = await retrieveHybridKnowledgeSnippets("一般耗材标准检验出库", {
      knowledgeBaseIds: [source.knowledgeBaseId],
      vectorProvider: sidecarProvider,
    });

    expect(result.debugEvidence).toMatchObject({
      vectorLane: { status: "ready", candidatesReturned: 1 },
      vectorHits: [
        expect.objectContaining({
          snippetId,
          profileId: profile.id,
          sourceId: `kb-${source.id}`,
          model: "local-e5-small",
          dimensions: 3,
        }),
      ],
      fusedHits: [
        expect.objectContaining({
          snippetId,
          lexicalRank: 1,
          vectorRank: 1,
          rrf: expect.objectContaining({
            vectorContribution: expect.any(Number),
          }),
        }),
      ],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not run vector retrieval for empty hybrid queries", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });
    await seedSearchProfile();
    await generateKnowledgeSnippetEmbedding((await prisma.knowledgeSnippet.findFirstOrThrow({ where: { sourceId: snippet.id } })).id);

    const result = await retrieveHybridKnowledgeSnippets(" ");

    expect(result.citations).toEqual([]);
    expect(result.debugEvidence.vectorLane).toMatchObject({
      status: "failed",
      reason: "empty-query",
    });
    expect(result.debugEvidence.fusedHits).toEqual([]);
  });

  it("runs an injected reranker seam without requiring an external provider", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    const result = await retrieveHybridKnowledgeSnippets("管理员 审批 流程", {
      reranker: {
        name: "test-reverse-reranker",
        async rerank(input) {
          return input.toReversed();
        },
      },
    });

    expect(result.debugEvidence.reranker).toEqual({
      name: "test-reverse-reranker",
      ran: true,
      acceptedCandidates: 1,
      rejectedCandidates: 0,
    });
    expect(result.debugEvidence.fusedHits[0].fusedRank).toBe(1);
  });

  it("sanitizes reranker output to existing capped candidates only", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSnippet(admin.id, {
      sourceEnabled: true,
      sourceStatus: "ready",
      versionStatus: "ready",
      snippetEnabled: true,
      content: "审批流程需要记录每个管理员确认步骤。",
    });

    const result = await retrieveHybridKnowledgeSnippets("管理员 审批 流程", {
      reranker: {
        name: "injecting-reranker",
        async rerank(input) {
          return [
            {
              ...input[0],
              snippetId: "not-a-real-candidate",
              sourceId: "kb-injected",
              sourceTitle: "Injected",
              path: "injected.md",
            },
            input[0],
            input[0],
          ];
        },
      },
    });

    expect(result.citations).toHaveLength(1);
    expect(result.debugEvidence.reranker).toMatchObject({
      name: "injecting-reranker",
      ran: true,
      acceptedCandidates: 1,
      rejectedCandidates: 2,
    });
    expect(result.debugEvidence.fusedHits[0].snippetId).not.toBe("not-a-real-candidate");
  });
});

describe("buildHybridContextWindow", () => {
  it("expands adjacent chunks and groups citations with provenance", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const seeded = await seedSnippetWindow(admin.id, {
      chunks: [
        { content: "前置材料需要先上传。" },
        { content: "管理员审批流程需要记录每个确认步骤。" },
        { content: "后续确认需要保留操作日志。" },
      ],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      adjacentChunks: 1,
      maxContextChars: 200,
      knowledgeBaseIds: [seeded.knowledgeBaseId],
    });

    expect(result.contextText).toContain("前置材料需要先上传。");
    expect(result.contextText).toContain("管理员审批流程需要记录每个确认步骤。");
    expect(result.contextText).toContain("后续确认需要保留操作日志。");
    expect(result.citationGroups).toHaveLength(1);
    expect(result.citationGroups[0]).toMatchObject({
      sourceId: `kb-${seeded.sourceId}`,
      path: "docs/window.md",
      snippetIds: seeded.snippets.map((snippet) => snippet.id),
    });
    expect(result.debugEvidence.contextWindow.included.map((item) => item.reason)).toEqual([
      "selected-hit",
      "adjacent",
      "adjacent",
    ]);
  });

  it("does not introduce disabled adjacent snippets during expansion", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const seeded = await seedSnippetWindow(admin.id, {
      chunks: [
        { content: "禁用相邻片段不应该进入上下文。", enabled: false },
        { content: "管理员审批流程需要记录每个确认步骤。" },
        { content: "启用相邻片段可以进入上下文。" },
      ],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      adjacentChunks: 1,
      maxContextChars: 200,
      knowledgeBaseIds: [seeded.knowledgeBaseId],
    });

    expect(result.contextText).not.toContain("禁用相邻片段");
    expect(result.contextText).toContain("启用相邻片段");
    expect(result.debugEvidence.contextWindow.included.map((item) => item.snippetId)).not.toContain(seeded.snippets[0].id);
  });

  it("caps context size and records capped snippets", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const seeded = await seedSnippetWindow(admin.id, {
      chunks: [
        { content: "管理员审批流程需要记录每个确认步骤。" },
        { content: "这个相邻片段因为长度限制应该被截断在上下文之外。" },
      ],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      adjacentChunks: 1,
      maxContextChars: seeded.snippets[0].content.length,
      knowledgeBaseIds: [seeded.knowledgeBaseId],
    });

    expect(result.contextText).toBe(seeded.snippets[0].content);
    expect(result.debugEvidence.contextWindow.cappedSnippetIds).toContain(seeded.snippets[1].id);
  });

  it("preserves selected hits before adjacent chunks when the cap is tight", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const seeded = await seedSnippetWindow(admin.id, {
      chunks: [
        { content: "很长的前置相邻内容应该被限制排除在外。" },
        { content: "管理员审批流程。" },
      ],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      adjacentChunks: 1,
      maxContextChars: seeded.snippets[1].content.length,
      knowledgeBaseIds: [seeded.knowledgeBaseId],
    });

    expect(result.contextText).toBe(seeded.snippets[1].content);
    expect(result.debugEvidence.contextWindow.included).toEqual([
      expect.objectContaining({ snippetId: seeded.snippets[1].id, reason: "selected-hit" }),
    ]);
    expect(result.debugEvidence.contextWindow.cappedSnippetIds).toContain(seeded.snippets[0].id);
  });

  it("counts separators when enforcing the context cap", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const seeded = await seedSnippetWindow(admin.id, {
      chunks: [
        { content: "管理员审批流程。" },
        { content: "短相邻。" },
      ],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      adjacentChunks: 1,
      maxContextChars: seeded.snippets[0].content.length + seeded.snippets[1].content.length,
      knowledgeBaseIds: [seeded.knowledgeBaseId],
    });

    expect(result.contextText.length).toBeLessThanOrEqual(seeded.snippets[0].content.length + seeded.snippets[1].content.length);
    expect(result.debugEvidence.contextWindow.cappedSnippetIds).toContain(seeded.snippets[1].id);
  });

  it("respects selected knowledge-base filters during context expansion", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const selected = await seedSnippetWindow(admin.id, {
      chunks: [{ content: "管理员审批流程来自选中知识库。" }],
    });
    const unselected = await seedSnippetWindow(admin.id, {
      chunks: [{ content: "管理员审批流程来自未选知识库。" }],
    });

    const result = await buildHybridContextWindow("管理员 审批 流程", {
      knowledgeBaseIds: [selected.knowledgeBaseId],
    });

    expect(result.contextText).toContain("选中知识库");
    expect(result.contextText).not.toContain("未选知识库");
    expect(result.debugEvidence.contextWindow.included.map((item) => item.snippetId)).not.toContain(unselected.snippets[0].id);
  });
});

async function seedSnippet(
  userId: string,
  input: {
    sourceEnabled: boolean;
    baseEnabled?: boolean;
    sourceStatus: string;
    versionStatus: string;
    snippetEnabled: boolean;
    content: string;
    searchMetadata?: {
      lexicalText: string;
      documentTitle: string;
      domainEntities: string[];
      processNames: string[];
      materialTypes: string[];
      approvalActions: string[];
      applicabilityRules: string[];
    };
  }
) {
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: Math.random().toString(36),
      slug: `base-${Math.random().toString(36).slice(2, 8)}`,
      enabled: input.baseEnabled ?? true,
      createdById: userId,
    },
  });
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: "Admin guide",
      status: input.sourceStatus,
      enabled: input.sourceEnabled,
      createdById: userId,
    },
  });

  const version = await prisma.knowledgeSourceVersion.create({
    data: {
      sourceId: source.id,
      originalFilename: "admin.md",
      storageKey: "test/admin.md",
      mimeType: "text/markdown",
      fileSize: 100,
      contentHash: Math.random().toString(36),
      importType: "document",
      status: input.versionStatus,
      createdById: userId,
      snippets: {
        create: {
          sourceId: source.id,
          sourcePath: "docs/admin.md",
          content: input.content,
          chunkIndex: 0,
          enabled: input.snippetEnabled,
        },
      },
    },
    include: { snippets: true },
  });

  const snippet = version.snippets[0];
  if (input.searchMetadata) {
    await prisma.knowledgeSnippetSearchMetadata.create({
      data: {
        snippetId: snippet.id,
        sourcePath: snippet.sourcePath,
        section: snippet.section,
        documentTitle: input.searchMetadata.documentTitle,
        lexicalText: input.searchMetadata.lexicalText,
        contentHash: `search-${Math.random().toString(36)}`,
        domainEntities: input.searchMetadata.domainEntities,
        processNames: input.searchMetadata.processNames,
        materialTypes: input.searchMetadata.materialTypes,
        approvalActions: input.searchMetadata.approvalActions,
        applicabilityRules: input.searchMetadata.applicabilityRules,
      },
    });
  }

  return source;
}

async function seedSnippetWindow(
  userId: string,
  input: {
    chunks: Array<{ content: string; enabled?: boolean }>;
    baseEnabled?: boolean;
    sourceEnabled?: boolean;
    versionStatus?: string;
  }
) {
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: Math.random().toString(36),
      slug: `base-${Math.random().toString(36).slice(2, 8)}`,
      enabled: input.baseEnabled ?? true,
      createdById: userId,
    },
  });
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: "Window guide",
      status: "ready",
      enabled: input.sourceEnabled ?? true,
      createdById: userId,
    },
  });
  const version = await prisma.knowledgeSourceVersion.create({
    data: {
      sourceId: source.id,
      originalFilename: "window.md",
      storageKey: "test/window.md",
      mimeType: "text/markdown",
      fileSize: 100,
      contentHash: Math.random().toString(36),
      importType: "document",
      status: input.versionStatus ?? "ready",
      createdById: userId,
      snippets: {
        create: input.chunks.map((chunk, index) => ({
          sourceId: source.id,
          sourcePath: "docs/window.md",
          content: chunk.content,
          chunkIndex: index,
          enabled: chunk.enabled ?? true,
        })),
      },
    },
  });
  const snippets = await prisma.knowledgeSnippet.findMany({
    where: { versionId: version.id },
    orderBy: { chunkIndex: "asc" },
  });
  return { knowledgeBaseId: knowledgeBase.id, sourceId: source.id, snippets };
}

async function seedSearchProfile(
  input: {
    provider?: string;
    model?: string;
    dimensions?: number;
    providerConfigId?: string | null;
  } = {}
) {
  return prisma.searchIndexProfile.create({
    data: {
      name: `profile-${Math.random().toString(36).slice(2, 8)}`,
      embeddingProviderConfigId: input.providerConfigId,
      embeddingProvider: input.provider ?? "deterministic-test",
      embeddingModel: input.model ?? "fake-embedding-v1",
      embeddingDimensions: input.dimensions ?? 3,
      semanticSpace: "test-semantic-space",
      lexicalEngine: "postgres-native-fts-fallback",
      status: "active",
      isActive: true,
    },
  });
}

async function findOnlySnippetId(): Promise<string> {
  const snippet = await prisma.knowledgeSnippet.findFirstOrThrow({ orderBy: { createdAt: "desc" } });
  return snippet.id;
}

function seedEmbeddingProviderConfig(
  userId: string,
  input: {
    provider: string;
    model: string;
    dimensions: number;
  }
) {
  return prisma.embeddingProviderConfig.create({
    data: {
      name: `embedding-${Math.random().toString(36).slice(2, 8)}`,
      provider: input.provider,
      model: input.model,
      dimensions: input.dimensions,
      baseUrl: "http://127.0.0.1:8081",
      noKeyMode: true,
      enabled: true,
      updatedById: userId,
    },
  });
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
