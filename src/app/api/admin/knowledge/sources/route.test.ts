import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  mockAuthSession,
  mockNoSession,
  jsonRequest,
  readJson,
  seedUser,
} from "@/test/api-test-helpers";

const mocks = vi.hoisted(() => ({
  deletePrivateKnowledgeFile: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/knowledge/private-storage", () => ({
  deletePrivateKnowledgeFile: mocks.deletePrivateKnowledgeFile,
}));

type Route = typeof import("./route");

let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: Route;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-sources-route");
  const helpers = await import("@/test/api-test-helpers");
  helpers.pushTestDatabaseSchema(process.env.DATABASE_URL);
  const prismaModule = await import("@/lib/prisma");
  prisma = prismaModule.prisma;
  const authModule = await import("@/auth");
  auth = vi.mocked(authModule.auth);
  route = await import("./route");

  return async () => {
    await disconnectPrisma(prisma);
    helpers.removeTestDatabase(process.env.DATABASE_URL);
  };
});

beforeEach(async () => {
  auth.mockReset();
  mocks.deletePrivateKnowledgeFile.mockReset();
  await clearDatabase(prisma);
});

describe("GET /api/admin/knowledge/sources", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.GET();
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.GET();
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("returns admin knowledge source views without private storage keys", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    await seedKnowledgeSource(admin.id);

    const response = await route.GET();
    const result = await readJson<{
      sources: Array<{ title: string; knowledgeBase: { slug: string }; versions: unknown[]; snippets: unknown[] }>;
    }>(
      response
    );

    expect(result.status).toBe(200);
    expect(result.body.sources[0]).toMatchObject({
      knowledgeBase: { slug: "default" },
      title: "Admin guide",
      versions: [expect.objectContaining({ originalFilename: "guide.md", status: "ready" })],
      snippets: [expect.objectContaining({ sourcePath: "docs/guide.md", section: "Guide" })],
    });
    expect(JSON.stringify(result.body)).not.toContain("private/storage-key");
    expect(JSON.stringify(result.body)).not.toContain(".local-data");
    expect(JSON.stringify(result.body)).not.toContain("public/uploads");
  });

  it("groups zip snippets by folder-like inner paths", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    await seedKnowledgeSource(admin.id, {
      title: "docs.zip",
      importType: "zip",
      originalFilename: "docs.zip",
      sourcePath: "module-a/api/guide.md",
      section: "Guide",
    });

    const response = await route.GET();
    const result = await readJson<{ sources: Array<{ title: string; versions: Array<{ importType: string }>; snippets: Array<{ sourcePath: string }> }> }>(
      response
    );

    expect(result.status).toBe(200);
    expect(result.body.sources[0]).toMatchObject({
      title: "docs.zip",
      versions: [expect.objectContaining({ importType: "zip" })],
      snippets: [expect.objectContaining({ sourcePath: "module-a/api/guide.md" })],
    });
  });
});

describe("DELETE /api/admin/knowledge/sources", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: ["source-1"] },
        { method: "DELETE" }
      )
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: ["source-1"] },
        { method: "DELETE" }
      )
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("rejects broad clear requests without selected source ids", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.DELETE(
      jsonRequest("http://localhost/api/admin/knowledge/sources", { confirmation: "CLEAR_KNOWLEDGE" }, { method: "DELETE" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "请选择要删除的知识来源" } });
  });

  it("deletes only selected sources for admins", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const selectedA = await seedKnowledgeSource(admin.id, { title: "A", storageKey: "private/a.md" });
    const selectedB = await seedKnowledgeSource(admin.id, { title: "B", storageKey: "private/b.md" });
    const retained = await seedKnowledgeSource(admin.id, { title: "C", storageKey: "private/c.md" });

    const response = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: [selectedA.id, selectedB.id] },
        { method: "DELETE" }
      )
    );
    const result = await readJson<{ deletedCount: number; storageCleanupErrors: string[] }>(response);

    expect(result).toEqual({ status: 200, body: { deletedCount: 2, storageCleanupErrors: [], success: true } });
    await expect(prisma.knowledgeSource.findMany({ select: { id: true } })).resolves.toEqual([{ id: retained.id }]);
    expect(mocks.deletePrivateKnowledgeFile).toHaveBeenCalledWith("private/a.md");
    expect(mocks.deletePrivateKnowledgeFile).toHaveBeenCalledWith("private/b.md");
    expect(mocks.deletePrivateKnowledgeFile).not.toHaveBeenCalledWith("private/c.md");
  });

  it("rejects selected delete when any selected source belongs to a disabled knowledge base", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const enabledSource = await seedKnowledgeSource(admin.id, { title: "A", storageKey: "private/a.md" });
    const disabledSource = await seedKnowledgeSource(admin.id, {
      title: "B",
      storageKey: "private/b.md",
      knowledgeBaseSlug: "archived",
      baseEnabled: false,
    });

    const response = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: [enabledSource.id, disabledSource.id] },
        { method: "DELETE" }
      )
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({
      status: 400,
      body: { error: "禁用/归档知识库下的内容不可清理，请先恢复知识库" },
    });
    await expect(prisma.knowledgeSource.count()).resolves.toBe(2);
    expect(mocks.deletePrivateKnowledgeFile).not.toHaveBeenCalled();
  });

  it("requires selected delete confirmation and ids", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const wrongConfirmation = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "CLEAR_KNOWLEDGE", sourceIds: ["source-1"] },
        { method: "DELETE" }
      )
    );
    expect(await readJson<{ error: string }>(wrongConfirmation)).toEqual({
      status: 400,
      body: { error: "确认短语不正确" },
    });

    const emptySelection = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: [] },
        { method: "DELETE" }
      )
    );
    expect(await readJson<{ error: string }>(emptySelection)).toEqual({
      status: 400,
      body: { error: "请选择要删除的知识来源" },
    });
  });

  it("does not delete anything when a selected source is missing", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const retained = await seedKnowledgeSource(admin.id, { title: "A", storageKey: "private/a.md" });

    const response = await route.DELETE(
      jsonRequest(
        "http://localhost/api/admin/knowledge/sources",
        { confirmation: "DELETE_SELECTED_SOURCES", sourceIds: [retained.id, "missing-source"] },
        { method: "DELETE" }
      )
    );

    expect(await readJson<{ error: string }>(response)).toEqual({
      status: 400,
      body: { error: "部分知识来源不存在" },
    });
    await expect(prisma.knowledgeSource.count()).resolves.toBe(1);
    expect(mocks.deletePrivateKnowledgeFile).not.toHaveBeenCalled();
  });
});

async function seedKnowledgeSource(
  userId: string,
  overrides: {
    title?: string;
    importType?: string;
    originalFilename?: string;
    sourcePath?: string;
    section?: string;
    storageKey?: string;
    knowledgeBaseSlug?: string;
    baseEnabled?: boolean;
  } = {}
) {
  const knowledgeBase = await prisma.knowledgeBase.upsert({
    where: { slug: overrides.knowledgeBaseSlug ?? "default" },
    update: {},
    create: {
      id: overrides.knowledgeBaseSlug === undefined ? "default" : undefined,
      name: overrides.knowledgeBaseSlug === undefined ? "默认知识库" : overrides.knowledgeBaseSlug,
      slug: overrides.knowledgeBaseSlug ?? "default",
      enabled: overrides.baseEnabled ?? true,
    },
  });
  if (overrides.baseEnabled !== undefined && knowledgeBase.enabled !== overrides.baseEnabled) {
    await prisma.knowledgeBase.update({ where: { id: knowledgeBase.id }, data: { enabled: overrides.baseEnabled } });
  }
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: overrides.title ?? "Admin guide",
      status: "ready",
      enabled: true,
      createdById: userId,
    },
  });
  const version = await prisma.knowledgeSourceVersion.create({
    data: {
      sourceId: source.id,
      originalFilename: overrides.originalFilename ?? "guide.md",
      storageKey: overrides.storageKey ?? "private/storage-key.md",
      mimeType: "text/markdown",
      fileSize: 120,
      contentHash: "hash",
      importType: overrides.importType ?? "document",
      status: "ready",
      createdById: userId,
    },
  });
  await prisma.knowledgeSnippet.create({
    data: {
      sourceId: source.id,
      versionId: version.id,
      sourcePath: overrides.sourcePath ?? "docs/guide.md",
      section: overrides.section ?? "Guide",
      content: "管理员知识库片段内容",
      chunkIndex: 0,
      enabled: true,
    },
  });
  return source;
}
