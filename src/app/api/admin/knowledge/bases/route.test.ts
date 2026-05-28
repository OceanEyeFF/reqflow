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
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-bases-route");
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

describe("GET /api/admin/knowledge/bases", () => {
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

  it("lists knowledge bases with source counts", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const base = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", createdById: admin.id },
    });
    await prisma.knowledgeSource.create({
      data: { title: "Pay guide", knowledgeBaseId: base.id, createdById: admin.id },
    });

    const response = await route.GET();
    const result = await readJson<{ knowledgeBases: Array<{ slug: string; sourceCount: number }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.knowledgeBases[0]).toMatchObject({ slug: "payments", sourceCount: 1 });
  });
});

describe("POST /api/admin/knowledge/bases", () => {
  it("creates a knowledge base for admins", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.POST(
      jsonRequest("http://localhost/api/admin/knowledge/bases", {
        name: "Payments Docs",
        slug: "payments-docs",
        description: "Payment product documents",
      })
    );
    const result = await readJson<{ knowledgeBase: { name: string; slug: string; enabled: boolean } }>(response);

    expect(result).toEqual({
      status: 201,
      body: {
        knowledgeBase: expect.objectContaining({
          name: "Payments Docs",
          slug: "payments-docs",
          enabled: true,
        }),
      },
    });
  });

  it("normalizes slugs and rejects duplicates", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const first = await route.POST(jsonRequest("http://localhost/api/admin/knowledge/bases", { name: "Payments Docs" }));
    expect((await readJson<{ knowledgeBase: { slug: string } }>(first)).body.knowledgeBase.slug).toBe("payments-docs");

    const duplicate = await route.POST(jsonRequest("http://localhost/api/admin/knowledge/bases", { name: "Payments Docs" }));
    const duplicateResult = await readJson<{ error: string }>(duplicate);

    expect(duplicateResult).toEqual({ status: 400, body: { error: "知识库标识已存在" } });
  });
});
