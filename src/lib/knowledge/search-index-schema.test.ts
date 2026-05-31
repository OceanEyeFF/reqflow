import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  seedUser,
} from "@/test/api-test-helpers";

let prisma: PrismaClient;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("search-index-schema");
  const helpers = await import("@/test/api-test-helpers");
  helpers.pushTestDatabaseSchema(process.env.DATABASE_URL);
  const prismaModule = await import("@/lib/prisma");
  prisma = prismaModule.prisma;

  return async () => {
    await disconnectPrisma(prisma);
    helpers.removeTestDatabase(process.env.DATABASE_URL);
  };
});

beforeEach(async () => {
  await clearDatabase(prisma);
});

describe("search index schema", () => {
  it("binds snippet metadata and embeddings to a specific search index profile", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id);
    const provider = await prisma.embeddingProviderConfig.create({
      data: {
        name: "local-test",
        provider: "deterministic-test",
        model: "fake-embedding-v1",
        dimensions: 4,
        noKeyMode: true,
        updatedById: admin.id,
      },
    });
    const profile = await prisma.searchIndexProfile.create({
      data: {
        name: "test-profile-v1",
        embeddingProviderConfigId: provider.id,
        embeddingProvider: provider.provider,
        embeddingModel: provider.model,
        embeddingDimensions: provider.dimensions,
        semanticSpace: "fake-embedding-v1:4",
        lexicalEngine: "postgres-native-fts",
        status: "active",
        isActive: true,
      },
    });

    await prisma.knowledgeSnippetSearchMetadata.create({
      data: {
        snippetId: snippet.id,
        sourcePath: snippet.sourcePath,
        section: snippet.section,
        documentTitle: "Admin Guide",
        lexicalText: "审批流程 管理员 确认步骤",
        contentHash: "snippet-content-hash",
        domainEntities: ["管理员"],
        processNames: ["审批流程"],
        materialTypes: ["操作指南"],
        approvalActions: ["确认"],
        applicabilityRules: ["管理员场景"],
      },
    });
    await prisma.knowledgeEmbedding.create({
      data: {
        snippetId: snippet.id,
        profileId: profile.id,
        model: profile.embeddingModel,
        dimensions: profile.embeddingDimensions,
        contentHash: "snippet-content-hash",
        status: "ready",
        vectorRef: "test-vector-ref",
        generatedAt: new Date("2026-05-31T09:00:00.000Z"),
      },
    });

    const indexedSnippet = await prisma.knowledgeSnippet.findUniqueOrThrow({
      where: { id: snippet.id },
      include: {
        searchMetadata: true,
        embeddings: { include: { profile: true } },
      },
    });

    expect(indexedSnippet.searchMetadata).toMatchObject({
      documentTitle: "Admin Guide",
      contentHash: "snippet-content-hash",
      domainEntities: ["管理员"],
      processNames: ["审批流程"],
      approvalActions: ["确认"],
    });
    expect(indexedSnippet.embeddings).toHaveLength(1);
    expect(indexedSnippet.embeddings[0]).toMatchObject({
      profileId: profile.id,
      model: "fake-embedding-v1",
      dimensions: 4,
      contentHash: "snippet-content-hash",
    });
    expect(indexedSnippet.embeddings[0].profile.semanticSpace).toBe("fake-embedding-v1:4");
  });

  it("prevents duplicate embedding records for the same snippet/profile pair", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    const snippet = await seedSnippet(admin.id);
    const profile = await prisma.searchIndexProfile.create({
      data: {
        name: "dedupe-profile",
        embeddingProvider: "deterministic-test",
        embeddingModel: "fake-embedding-v1",
        embeddingDimensions: 4,
        semanticSpace: "fake-embedding-v1:4",
        lexicalEngine: "postgres-native-fts",
        status: "active",
        isActive: true,
      },
    });
    const data = {
      snippetId: snippet.id,
      profileId: profile.id,
      model: profile.embeddingModel,
      dimensions: profile.embeddingDimensions,
      contentHash: "same-hash",
      status: "ready",
    };

    await prisma.knowledgeEmbedding.create({ data });
    await expect(prisma.knowledgeEmbedding.create({ data })).rejects.toThrow();
  });
});

async function seedSnippet(userId: string) {
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: "Search Index Base",
      slug: `search-index-${Math.random().toString(36).slice(2, 8)}`,
      enabled: true,
      createdById: userId,
    },
  });
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: "Admin guide",
      status: "ready",
      enabled: true,
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
      contentHash: "version-content-hash",
      importType: "document",
      status: "ready",
      createdById: userId,
    },
  });

  return prisma.knowledgeSnippet.create({
    data: {
      sourceId: source.id,
      versionId: version.id,
      sourcePath: "docs/admin.md",
      section: "Approval",
      content: "审批流程需要记录每个管理员确认步骤。",
      chunkIndex: 0,
      enabled: true,
    },
  });
}
