import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  mockAuthSession,
  mockNoSession,
  readJson,
  seedUser,
} from "@/test/api-test-helpers";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/knowledge/private-storage", () => ({
  writePrivateKnowledgeFile: vi.fn(async (_buffer: Buffer, extension: string) => `test/upload-${Math.random().toString(36)}${extension}`),
}));

type Route = typeof import("./route");

let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: Route;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-upload-route");
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

describe("POST /api/admin/knowledge/uploads", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.POST(formRequest(new File(["hello"], "guide.md")));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.POST(formRequest(new File(["hello"], "guide.md")));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("stores allowed document uploads privately and returns metadata only", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.POST(formRequest(new File(["# Guide"], "guide.md", { type: "text/markdown" })));
    const result = await readJson<{
      source: { title: string; importType: string; contentHash: string; knowledgeBase: { slug: string } };
      sources: Array<{ title: string }>;
    }>(response);

    expect(result.status).toBe(201);
    expect(result.body.source).toMatchObject({
      title: "guide.md",
      importType: "document",
      knowledgeBase: { slug: "default" },
    });
    expect(result.body.source.contentHash).toHaveLength(64);
    expect(result.body.sources).toHaveLength(1);
    await expect(prisma.knowledgeBase.findUnique({ where: { slug: "default" } })).resolves.toMatchObject({
      name: "默认知识库",
    });
    expect(JSON.stringify(result.body)).not.toContain(".local-data");
    expect(JSON.stringify(result.body)).not.toContain("public/uploads");
  });

  it("stores uploads in an explicit knowledge base", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", createdById: admin.id },
    });

    const response = await route.POST(
      formRequest(new File(["# Guide"], "guide.md", { type: "text/markdown" }), knowledgeBase.id)
    );
    const result = await readJson<{ source: { id: string; knowledgeBase: { id: string; slug: string } } }>(response);

    expect(result.status).toBe(201);
    expect(result.body.source.knowledgeBase).toMatchObject({ id: knowledgeBase.id, slug: "payments" });
    await expect(prisma.knowledgeSource.findUnique({ where: { id: result.body.source.id } })).resolves.toMatchObject({
      knowledgeBaseId: knowledgeBase.id,
    });
  });

  it("stores multiple files in an explicit knowledge base", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", createdById: admin.id },
    });

    const response = await route.POST(
      formRequest(
        [
          new File(["# Guide"], "guide.md", { type: "text/markdown" }),
          new File(["{\"policy\":true}"], "policy.json", { type: "application/json" }),
        ],
        knowledgeBase.id
      )
    );
    const result = await readJson<{
      source: { title: string };
      sources: Array<{ id: string; title: string; knowledgeBase: { id: string }; importType: string }>;
    }>(response);

    expect(result.status).toBe(201);
    expect(result.body.source.title).toBe("guide.md");
    expect(result.body.sources).toHaveLength(2);
    expect(result.body.sources.map((source) => source.title)).toEqual(["guide.md", "policy.json"]);
    expect(result.body.sources.every((source) => source.knowledgeBase.id === knowledgeBase.id)).toBe(true);
    await expect(prisma.knowledgeSource.count({ where: { knowledgeBaseId: knowledgeBase.id } })).resolves.toBe(2);
  });

  it("accepts the files field for multiple file clients", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.POST(
      formRequest([new File(["# A"], "a.md"), new File(["# B"], "b.md")], undefined, "files")
    );
    const result = await readJson<{ sources: Array<{ title: string }> }>(response);

    expect(result.status).toBe(201);
    expect(result.body.sources.map((source) => source.title)).toEqual(["a.md", "b.md"]);
  });

  it("rejects a mixed batch before creating sources", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.POST(formRequest([new File(["# A"], "a.md"), new File(["bad"], "run.exe")]));
    const result = await readJson<{ error: string }>(response);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("不支持的知识库文件类型");
    await expect(prisma.knowledgeSource.count()).resolves.toBe(0);
  });

  it("rejects unsupported files and unsafe zip entries", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const unsupported = await route.POST(formRequest(new File(["bad"], "run.exe")));
    expect((await readJson<{ error: string }>(unsupported)).status).toBe(400);

    const unsafeZip = await route.POST(formRequest(new File([createStoredZip("../secret.md")], "docs.zip")));
    expect((await readJson<{ error: string }>(unsafeZip)).body.error).toBe("zip 文件包含不安全路径");
  });
});

function formRequest(file: File | File[], knowledgeBaseId?: string, fieldName = "file"): Request {
  const formData = new FormData();
  for (const item of Array.isArray(file) ? file : [file]) {
    formData.append(fieldName, item);
  }
  if (knowledgeBaseId) formData.set("knowledgeBaseId", knowledgeBaseId);
  return new Request("http://localhost/api/admin/knowledge/uploads", {
    method: "POST",
    body: formData,
  });
}

function createStoredZip(name: string): Buffer {
  const nameBuffer = Buffer.from(name);
  const content = Buffer.from("hello");
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt32LE(0, 10);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(content.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBuffer, content]);
}
