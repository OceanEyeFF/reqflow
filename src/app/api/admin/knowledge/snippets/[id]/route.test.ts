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

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

type Route = typeof import("./route");

let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: Route;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-snippet-toggle-route");
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
  await clearDatabase(prisma);
});

describe("PATCH /api/admin/knowledge/snippets/[id]", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/snippets/snippet-1", { enabled: false }, { method: "PATCH" }),
      routeParams({ id: "snippet-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/snippets/snippet-1", { enabled: false }, { method: "PATCH" }),
      routeParams({ id: "snippet-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("toggles snippet enabled state", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const snippet = await seedSnippet(admin.id);

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/snippets/${snippet.id}`, { enabled: false }, { method: "PATCH" }),
      routeParams({ id: snippet.id })
    );
    const result = await readJson<{ snippet: { enabled: boolean; sourcePath: string } }>(response);

    expect(result).toMatchObject({
      status: 200,
      body: { snippet: { enabled: false, sourcePath: "docs/guide.md" } },
    });
  });
});

async function seedSnippet(userId: string) {
  const knowledgeBase = await prisma.knowledgeBase.upsert({
    where: { slug: "default" },
    update: {},
    create: { id: "default", name: "默认知识库", slug: "default" },
  });
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
      storageKey: "private/storage-key.md",
      mimeType: "text/markdown",
      fileSize: 120,
      contentHash: "hash",
      importType: "document",
      status: "ready",
      createdById: userId,
    },
  });
  return prisma.knowledgeSnippet.create({
    data: {
      sourceId: source.id,
      versionId: version.id,
      sourcePath: "docs/guide.md",
      content: "管理员知识库片段内容",
      chunkIndex: 0,
      enabled: true,
    },
  });
}
