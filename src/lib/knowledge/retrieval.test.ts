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
let tokenize: typeof import("./retrieval").tokenize;

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
  tokenize = retrievalModule.tokenize;

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

async function seedSnippet(
  userId: string,
  input: {
    sourceEnabled: boolean;
    baseEnabled?: boolean;
    sourceStatus: string;
    versionStatus: string;
    snippetEnabled: boolean;
    content: string;
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

  await prisma.knowledgeSourceVersion.create({
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
  });

  return source;
}
