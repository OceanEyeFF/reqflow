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
  process.env.DATABASE_URL = createTestDatabaseUrl("admin-ai-provider-route");
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

describe("/api/admin/ai-provider", () => {
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

  it("saves cloud config and masks api key", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.PUT(
      jsonRequest("http://localhost/api/admin/ai-provider", {
        baseUrl: "https://api.example.test",
        model: "model-x",
        apiKey: "sk-secret-value",
        noKeyMode: false,
        enabled: true,
      }, { method: "PUT" })
    );
    const result = await readJson<{ config: { maskedApiKey: string; hasApiKey: boolean } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.config).toMatchObject({ hasApiKey: true, maskedApiKey: "sk-...alue" });
    expect(JSON.stringify(result.body)).not.toContain("sk-secret-value");
  });

  it("allows localhost no-key mode", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.PUT(
      jsonRequest("http://localhost/api/admin/ai-provider", {
        baseUrl: "http://localhost:1234/v1",
        model: "local-model",
        noKeyMode: true,
        enabled: true,
      }, { method: "PUT" })
    );
    const result = await readJson<{ config: { noKeyMode: boolean; hasApiKey: boolean } }>(response);

    expect(result).toMatchObject({ status: 200, body: { config: { noKeyMode: true, hasApiKey: false } } });
  });
});
