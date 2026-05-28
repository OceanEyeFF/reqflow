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

    const response = await route.DELETE(jsonRequest("http://localhost/api/admin/knowledge/sources", { confirmation: "CLEAR_KNOWLEDGE" }, { method: "DELETE" }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.DELETE(jsonRequest("http://localhost/api/admin/knowledge/sources", { confirmation: "CLEAR_KNOWLEDGE" }, { method: "DELETE" }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("requires an explicit clear confirmation phrase", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.DELETE(jsonRequest("http://localhost/api/admin/knowledge/sources", { confirmation: "wrong" }, { method: "DELETE" }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "确认短语不正确" } });
  });

  it("clears all sources and parsed snippets for admins", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    await seedKnowledgeSource(admin.id, { title: "A", storageKey: "private/a.md" });
    await seedKnowledgeSource(admin.id, { title: "B", storageKey: "private/b.md" });

    const response = await route.DELETE(jsonRequest("http://localhost/api/admin/knowledge/sources", { confirmation: "CLEAR_KNOWLEDGE" }, { method: "DELETE" }));
    const result = await readJson<{ deletedCount: number; storageCleanupErrors: string[] }>(response);

    expect(result).toEqual({ status: 200, body: { deletedCount: 2, storageCleanupErrors: [], success: true } });
    await expect(prisma.knowledgeSource.count()).resolves.toBe(0);
    await expect(prisma.knowledgeSourceVersion.count()).resolves.toBe(0);
    await expect(prisma.knowledgeSnippet.count()).resolves.toBe(0);
    expect(mocks.deletePrivateKnowledgeFile).toHaveBeenCalledWith("private/a.md");
    expect(mocks.deletePrivateKnowledgeFile).toHaveBeenCalledWith("private/b.md");
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
  } = {}
) {
  const knowledgeBase = await prisma.knowledgeBase.upsert({
    where: { slug: "default" },
    update: {},
    create: { id: "default", name: "默认知识库", slug: "default" },
  });
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
