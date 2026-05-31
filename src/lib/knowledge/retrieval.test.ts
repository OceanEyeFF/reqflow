import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
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

    expect(result.debugEvidence.engine).toBe("postgres-native-fts-fallback");
    expect(result.debugEvidence.lexicalHits.every((hit) => hit.engine === "postgres-native-fts-fallback")).toBe(true);
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
      reason: "vector-exception",
      evidence: { message: "provider offline" },
    });
    expect(result.debugEvidence.fusedHits[0]).toMatchObject({
      lexicalRank: 1,
      rrf: expect.objectContaining({ vectorContribution: 0 }),
    });
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

async function seedSearchProfile() {
  return prisma.searchIndexProfile.create({
    data: {
      name: `profile-${Math.random().toString(36).slice(2, 8)}`,
      embeddingProvider: "deterministic-test",
      embeddingModel: "fake-embedding-v1",
      embeddingDimensions: 3,
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
