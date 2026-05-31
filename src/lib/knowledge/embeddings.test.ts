import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  seedUser,
} from "@/test/api-test-helpers";
import type { EmbeddingProvider } from "./embeddings";

let prisma: PrismaClient;
let generateKnowledgeSnippetEmbedding: typeof import("./embeddings").generateKnowledgeSnippetEmbedding;
let retrieveVectorCandidates: typeof import("./embeddings").retrieveVectorCandidates;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("knowledge-embeddings");
  const helpers = await import("@/test/api-test-helpers");
  helpers.pushTestDatabaseSchema(process.env.DATABASE_URL);
  const prismaModule = await import("@/lib/prisma");
  prisma = prismaModule.prisma;
  const embeddingsModule = await import("./embeddings");
  generateKnowledgeSnippetEmbedding = embeddingsModule.generateKnowledgeSnippetEmbedding;
  retrieveVectorCandidates = embeddingsModule.retrieveVectorCandidates;

  return async () => {
    await disconnectPrisma(prisma);
    helpers.removeTestDatabase(process.env.DATABASE_URL);
  };
});

beforeEach(async () => {
  await clearDatabase(prisma);
});

describe("generateKnowledgeSnippetEmbedding", () => {
  it("fails closed when there is no active search index profile", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id)).resolves.toMatchObject({
      status: "failed",
      reason: "active-profile-missing",
    });
  });

  it("fails closed when the active profile is not active status", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ status: "building", isActive: true });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id)).resolves.toMatchObject({
      status: "failed",
      reason: "active-profile-not-ready",
      evidence: { profileStatus: "building", profileIsActive: true },
    });
  });

  it("fails closed when multiple profiles are active", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ model: "fake-embedding-v1" });
    await seedSearchProfile({ model: "fake-embedding-v2" });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id)).resolves.toMatchObject({
      status: "failed",
      reason: "active-profile-ambiguous",
    });
  });

  it("generates a deterministic pgvector embedding for a ready snippet", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, {
      content: "正文只说配置。",
      searchMetadata: { lexicalText: "管理员 审批 流程" },
    });
    const profile = await seedSearchProfile();

    const result = await generateKnowledgeSnippetEmbedding(snippet.id);

    expect(result).toMatchObject({
      status: "ready",
      snippetId: snippet.id,
      profileId: profile.id,
      provider: "deterministic-test",
      model: "fake-embedding-v1",
      dimensions: 3,
    });
    const rows = await prisma.$queryRaw<{ id: string; vectorText: string }[]>`
      SELECT "id", "embedding"::text AS "vectorText"
      FROM "KnowledgeEmbedding"
      WHERE "snippetId" = ${snippet.id} AND "profileId" = ${profile.id}
    `;
    expect(rows).toHaveLength(1);
    expect(rows[0].vectorText).toMatch(/^\[/);
  });

  it("fails closed when provider output dimensions do not match the active profile", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ dimensions: 3 });
    const badProvider: EmbeddingProvider = {
      name: "deterministic-test",
      async embed() {
        return { provider: "deterministic-test", model: "fake-embedding-v1", dimensions: 2, vector: [0.1, 0.2] };
      },
    };

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, badProvider)).resolves.toMatchObject({
      status: "failed",
      reason: "dimensions-mismatch",
      evidence: { expectedDimensions: 3, actualDimensions: 2 },
    });
  });

  it("fails closed when the selected provider throws during generation", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const config = await seedEmbeddingProviderConfig(admin.id, {
      provider: "local-cpu-sidecar",
      model: "local-model",
      dimensions: 3,
    });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ provider: "local-cpu-sidecar", model: "local-model", dimensions: 3, providerConfigId: config.id });
    const throwingProvider: EmbeddingProvider = {
      name: "local-cpu-sidecar",
      async embed() {
        throw new Error("sidecar unavailable");
      },
    };

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, throwingProvider)).resolves.toMatchObject({
      status: "failed",
      reason: "provider-unavailable",
      evidence: { provider: "local-cpu-sidecar", model: "local-model", expectedDimensions: 3, snippetId: snippet.id },
    });
  });

  it("fails closed when provider output identity does not match the active profile", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ provider: "deterministic-test", model: "fake-embedding-v1", dimensions: 3 });
    const wrongModelProvider: EmbeddingProvider = {
      name: "deterministic-test",
      async embed() {
        return {
          provider: "deterministic-test",
          model: "other-semantic-space",
          dimensions: 3,
          vector: [0.1, 0.2, 0.3],
        };
      },
    };

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, wrongModelProvider)).resolves.toMatchObject({
      status: "failed",
      reason: "provider-output-mismatch",
      evidence: { provider: "deterministic-test", model: "other-semantic-space" },
    });
  });

  it("fails closed when a non-test provider lacks server-side config", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ provider: "external-embedding", providerConfigId: null });
    const provider = createPassthroughProvider("external-embedding", 3);

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, provider)).resolves.toMatchObject({
      status: "failed",
      reason: "provider-config-unavailable",
    });
  });

  it("fails closed when non-test provider config is disabled or mismatched", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const disabledConfig = await prisma.embeddingProviderConfig.create({
      data: {
        name: "disabled-embedding",
        provider: "external-embedding",
        model: "external-v1",
        dimensions: 3,
        enabled: false,
        updatedById: admin.id,
      },
    });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({
      provider: "external-embedding",
      model: "external-v1",
      dimensions: 3,
      providerConfigId: disabledConfig.id,
    });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, createPassthroughProvider("external-embedding", 3))).resolves.toMatchObject({
      status: "failed",
      reason: "provider-disabled",
    });

    await prisma.searchIndexProfile.deleteMany();
    const mismatchedConfig = await prisma.embeddingProviderConfig.create({
      data: {
        name: "mismatched-embedding",
        provider: "external-embedding",
        model: "external-v1",
        dimensions: 2,
        enabled: true,
        updatedById: admin.id,
      },
    });
    await seedSearchProfile({
      provider: "external-embedding",
      model: "external-v1",
      dimensions: 3,
      providerConfigId: mismatchedConfig.id,
    });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id, createPassthroughProvider("external-embedding", 3))).resolves.toMatchObject({
      status: "failed",
      reason: "dimensions-mismatch",
      evidence: { expectedDimensions: 3, actualDimensions: 2 },
    });
  });

  it("fails closed when the selected provider does not match the active profile", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "管理员审批流程" });
    await seedSearchProfile({ provider: "external-embedding" });

    await expect(generateKnowledgeSnippetEmbedding(snippet.id)).resolves.toMatchObject({
      status: "failed",
      reason: "provider-unavailable",
    });
  });
});

describe("retrieveVectorCandidates", () => {
  it("returns same-profile vector candidates with explainable evidence", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const selected = await seedSnippet(admin.id, {
      content: "管理员审批流程需要记录每个确认步骤。",
      searchMetadata: { lexicalText: "管理员 审批 流程 确认" },
    });
    await seedSnippet(admin.id, {
      content: "账号登录页面样式。",
      searchMetadata: { lexicalText: "账号 登录 页面 样式" },
    });
    const profile = await seedSearchProfile();
    await generateKnowledgeSnippetEmbedding(selected.id);

    const result = await retrieveVectorCandidates("管理员审批流程", { knowledgeBaseIds: [selected.knowledgeBaseId] });

    expect(result).toMatchObject({
      status: "ready",
      profileId: profile.id,
      provider: "deterministic-test",
      dimensions: 3,
      candidatesReturned: 1,
      vectorHits: [
        expect.objectContaining({
          snippetId: selected.id,
          profileId: profile.id,
          sourceId: `kb-${selected.sourceId}`,
          sourceTitle: "Admin guide",
          path: "docs/admin.md",
          rank: 1,
          model: "fake-embedding-v1",
          dimensions: 3,
        }),
      ],
    });
    expect(result.status === "ready" ? result.vectorHits[0].score : 0).toBeGreaterThan(0);
  });

  it("does not return embeddings from inactive profiles or disabled knowledge bases", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const activeSnippet = await seedSnippet(admin.id, { content: "审批流程来自启用知识库。" });
    const disabledSnippet = await seedSnippet(admin.id, {
      content: "审批流程来自停用知识库。",
      baseEnabled: false,
    });
    await seedSearchProfile();
    await generateKnowledgeSnippetEmbedding(activeSnippet.id);
    const disabledResult = await generateKnowledgeSnippetEmbedding(disabledSnippet.id);

    expect(disabledResult).toMatchObject({ status: "failed", reason: "snippet-unavailable" });
    const result = await retrieveVectorCandidates("审批流程");

    expect(result.status).toBe("ready");
    expect(result.status === "ready" ? result.vectorHits.map((hit) => hit.snippetId) : []).toEqual([activeSnippet.id]);
  });

  it("fails closed for disabled snippets, sources, and versions during generation", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    await seedSearchProfile();
    const disabledSnippet = await seedSnippet(admin.id, { content: "禁用片段", snippetEnabled: false });
    const disabledSource = await seedSnippet(admin.id, { content: "禁用来源", sourceEnabled: false });
    const draftVersion = await seedSnippet(admin.id, { content: "未就绪版本", versionStatus: "uploaded" });

    await expect(generateKnowledgeSnippetEmbedding(disabledSnippet.id)).resolves.toMatchObject({
      status: "failed",
      reason: "snippet-unavailable",
    });
    await expect(generateKnowledgeSnippetEmbedding(disabledSource.id)).resolves.toMatchObject({
      status: "failed",
      reason: "snippet-unavailable",
    });
    await expect(generateKnowledgeSnippetEmbedding(draftVersion.id)).resolves.toMatchObject({
      status: "failed",
      reason: "snippet-unavailable",
    });
  });

  it("fails closed when query embedding dimensions mismatch the active profile", async () => {
    await seedSearchProfile({ dimensions: 3 });
    const badProvider = createPassthroughProvider("deterministic-test", 2);

    await expect(retrieveVectorCandidates("审批流程", { provider: badProvider })).resolves.toMatchObject({
      status: "failed",
      reason: "dimensions-mismatch",
      evidence: { expectedDimensions: 3, actualDimensions: 2 },
      vectorHits: [],
    });
  });

  it("fails closed when the selected provider throws during vector retrieval", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const config = await seedEmbeddingProviderConfig(admin.id, {
      provider: "local-cpu-sidecar",
      model: "local-model",
      dimensions: 3,
    });
    await seedSearchProfile({ provider: "local-cpu-sidecar", model: "local-model", dimensions: 3, providerConfigId: config.id });
    const throwingProvider: EmbeddingProvider = {
      name: "local-cpu-sidecar",
      async embed() {
        throw new Error("sidecar unavailable");
      },
    };

    await expect(retrieveVectorCandidates("审批流程", { provider: throwingProvider })).resolves.toMatchObject({
      status: "failed",
      reason: "provider-unavailable",
      evidence: { provider: "local-cpu-sidecar", model: "local-model", expectedDimensions: 3 },
      vectorHits: [],
    });
  });

  it("ignores corrupt rows whose physical vector dimensions do not match metadata", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id, { content: "审批流程来自损坏向量。" });
    const profile = await seedSearchProfile({ dimensions: 3 });
    await prisma.$executeRaw`
      INSERT INTO "KnowledgeEmbedding" (
        "id",
        "snippetId",
        "profileId",
        "model",
        "dimensions",
        "contentHash",
        "status",
        "embedding",
        "generatedAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        'corrupt-vector-row',
        ${snippet.id},
        ${profile.id},
        'fake-embedding-v1',
        3,
        'corrupt-hash',
        'ready',
        '[0.1,0.2]'::public.vector,
        now(),
        now(),
        now()
      )
    `;

    const result = await retrieveVectorCandidates("审批流程");

    expect(result).toMatchObject({ status: "ready", candidatesReturned: 0, vectorHits: [] });
  });
});

async function seedSearchProfile(
  input: {
    provider?: string;
    model?: string;
    dimensions?: number;
    status?: string;
    isActive?: boolean;
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
      status: input.status ?? "active",
      isActive: input.isActive ?? true,
    },
  });
}

async function seedSnippet(
  userId: string,
  input: {
    content: string;
    baseEnabled?: boolean;
    sourceEnabled?: boolean;
    versionStatus?: string;
    snippetEnabled?: boolean;
    searchMetadata?: { lexicalText: string };
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
      status: "ready",
      enabled: input.sourceEnabled ?? true,
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
      status: input.versionStatus ?? "ready",
      createdById: userId,
      snippets: {
        create: {
          sourceId: source.id,
          sourcePath: "docs/admin.md",
          content: input.content,
          chunkIndex: 0,
          enabled: input.snippetEnabled ?? true,
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
        documentTitle: "管理员审批流程",
        lexicalText: input.searchMetadata.lexicalText,
        contentHash: `search-${Math.random().toString(36)}`,
        domainEntities: ["管理员"],
        processNames: ["审批流程"],
        materialTypes: ["操作指南"],
        approvalActions: ["确认"],
        applicabilityRules: ["后台管理"],
      },
    });
  }

  return { ...snippet, knowledgeBaseId: knowledgeBase.id, sourceId: source.id };
}

function createPassthroughProvider(name: string, dimensions: number): EmbeddingProvider {
  return {
    name,
    async embed(request) {
      return {
        provider: name,
        model: request.model,
        dimensions,
        vector: Array.from({ length: dimensions }, (_, index) => (index + 1) / dimensions),
      };
    },
  };
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
