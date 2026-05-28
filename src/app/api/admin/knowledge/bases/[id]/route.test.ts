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
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-knowledge-base-update-route");
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

describe("PATCH /api/admin/knowledge/bases/[id]", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/bases/base-1", { name: "New" }, { method: "PATCH" }),
      routeParams({ id: "base-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("requires admin role", async () => {
    mockAuthSession(auth, { id: "user-1", role: "user" });

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/admin/knowledge/bases/base-1", { name: "New" }, { method: "PATCH" }),
      routeParams({ id: "base-1" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("updates name and description without changing slug", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", description: "Old", createdById: admin.id },
    });

    const response = await route.PATCH(
      jsonRequest(
        `http://localhost/api/admin/knowledge/bases/${knowledgeBase.id}`,
        { name: "Payments Ops", description: "New description" },
        { method: "PATCH" }
      ),
      routeParams({ id: knowledgeBase.id })
    );
    const result = await readJson<{ knowledgeBase: { name: string; description: string; slug: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.knowledgeBase).toMatchObject({
      name: "Payments Ops",
      description: "New description",
      slug: "payments",
    });
  });

  it("rejects slug updates", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", createdById: admin.id },
    });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/bases/${knowledgeBase.id}`, { slug: "renamed" }, { method: "PATCH" }),
      routeParams({ id: knowledgeBase.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "知识库内部标识不可修改" } });
    await expect(prisma.knowledgeBase.findUnique({ where: { id: knowledgeBase.id } })).resolves.toMatchObject({ slug: "payments" });
  });

  it("disables and restores non-default knowledge bases", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", createdById: admin.id },
    });

    const disabled = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/bases/${knowledgeBase.id}`, { enabled: false }, { method: "PATCH" }),
      routeParams({ id: knowledgeBase.id })
    );
    expect(await readJson<{ knowledgeBase: { enabled: boolean } }>(disabled)).toMatchObject({
      status: 200,
      body: { knowledgeBase: { enabled: false } },
    });

    const restored = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/bases/${knowledgeBase.id}`, { enabled: true }, { method: "PATCH" }),
      routeParams({ id: knowledgeBase.id })
    );
    expect(await readJson<{ knowledgeBase: { enabled: boolean } }>(restored)).toMatchObject({
      status: 200,
      body: { knowledgeBase: { enabled: true } },
    });
  });

  it("rejects disabling the default knowledge base", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: { id: "default", name: "默认知识库", slug: "default", createdById: admin.id },
    });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/bases/${knowledgeBase.id}`, { enabled: false }, { method: "PATCH" }),
      routeParams({ id: knowledgeBase.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "默认知识库不可禁用" } });
    await expect(prisma.knowledgeBase.findUnique({ where: { id: "default" } })).resolves.toMatchObject({ enabled: true });
  });
});
