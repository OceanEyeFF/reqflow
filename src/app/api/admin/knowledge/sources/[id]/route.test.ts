import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  jsonRequest,
  mockAuthSession,
  mockNoSession,
  readJson,
  routeParams,
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
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-source-toggle-route");
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

describe("PATCH /api/admin/knowledge/sources/[id]", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { enabled: true }, { method: "PATCH" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { enabled: true }, { method: "PATCH" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("enables ready sources and marks enabled status", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await ensureDefaultKnowledgeBase();
    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        title: "Guide",
        status: "ready",
        enabled: false,
        createdById: admin.id,
      },
    });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/sources/${source.id}`, { enabled: true }, { method: "PATCH" }),
      routeParams({ id: source.id })
    );
    const result = await readJson<{ source: { enabled: boolean; status: string } }>(response);

    expect(result).toMatchObject({ status: 200, body: { source: { enabled: true, status: "enabled" } } });
  });

  it("rejects enabling unparsed sources", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await ensureDefaultKnowledgeBase();
    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        title: "Guide",
        status: "uploaded",
        enabled: false,
        createdById: admin.id,
      },
    });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/sources/${source.id}`, { enabled: true }, { method: "PATCH" }),
      routeParams({ id: source.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "只能启用已解析成功的知识来源" } });
  });
});

describe("DELETE /api/admin/knowledge/sources/[id]", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.DELETE(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { confirmation: "DELETE_SOURCE" }, { method: "DELETE" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.DELETE(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { confirmation: "DELETE_SOURCE" }, { method: "DELETE" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("requires an explicit source delete confirmation phrase", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.DELETE(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { confirmation: "wrong" }, { method: "DELETE" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "确认短语不正确" } });
  });

  it("returns 404 for missing sources", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.DELETE(
      jsonRequest("http://localhost/api/admin/knowledge/sources/source-1", { confirmation: "DELETE_SOURCE" }, { method: "DELETE" }),
      routeParams({ id: "source-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 404, body: { error: "知识来源不存在" } });
  });

  it("deletes a source, cascades versions and snippets, and cleans private files", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const source = await seedKnowledgeSource(admin.id, "private/source.md");

    const response = await route.DELETE(
      jsonRequest(`http://localhost/api/admin/knowledge/sources/${source.id}`, { confirmation: "DELETE_SOURCE" }, { method: "DELETE" }),
      routeParams({ id: source.id })
    );
    const result = await readJson<{ deletedCount: number; storageCleanupErrors: string[] }>(response);

    expect(result).toEqual({ status: 200, body: { deletedCount: 1, storageCleanupErrors: [], success: true } });
    await expect(prisma.knowledgeSource.count()).resolves.toBe(0);
    await expect(prisma.knowledgeSourceVersion.count()).resolves.toBe(0);
    await expect(prisma.knowledgeSnippet.count()).resolves.toBe(0);
    expect(mocks.deletePrivateKnowledgeFile).toHaveBeenCalledWith("private/source.md");
  });

  it("records private storage cleanup failures without restoring deleted database rows", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    mocks.deletePrivateKnowledgeFile.mockRejectedValueOnce(new Error("locked"));
    const source = await seedKnowledgeSource(admin.id, "private/source.md");

    const response = await route.DELETE(
      jsonRequest(`http://localhost/api/admin/knowledge/sources/${source.id}`, { confirmation: "DELETE_SOURCE" }, { method: "DELETE" }),
      routeParams({ id: source.id })
    );
    const result = await readJson<{ deletedCount: number; storageCleanupErrors: string[] }>(response);

    expect(result).toEqual({ status: 200, body: { deletedCount: 1, storageCleanupErrors: ["private/source.md"], success: true } });
    await expect(prisma.knowledgeSource.count()).resolves.toBe(0);
  });
});

async function seedKnowledgeSource(userId: string, storageKey: string) {
  const knowledgeBase = await ensureDefaultKnowledgeBase();
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: "Guide",
      status: "ready",
      enabled: true,
      createdById: userId,
    },
  });
  const version = await prisma.knowledgeSourceVersion.create({
    data: {
      sourceId: source.id,
      originalFilename: "guide.md",
      storageKey,
      mimeType: "text/markdown",
      fileSize: 100,
      contentHash: "hash",
      importType: "document",
      status: "ready",
      createdById: userId,
    },
  });
  await prisma.knowledgeSnippet.create({
    data: {
      sourceId: source.id,
      versionId: version.id,
      sourcePath: "docs/guide.md",
      content: "管理员知识库片段内容",
      chunkIndex: 0,
      enabled: true,
    },
  });
  return source;
}

async function ensureDefaultKnowledgeBase() {
  return prisma.knowledgeBase.upsert({
    where: { slug: "default" },
    update: {},
    create: { id: "default", name: "默认知识库", slug: "default" },
  });
}
