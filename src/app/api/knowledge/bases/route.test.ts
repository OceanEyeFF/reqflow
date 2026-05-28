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

type Route = typeof import("./route");

let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: Route;

beforeAll(async () => {
  process.env.DATABASE_URL = createTestDatabaseUrl("knowledge-bases-route");
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

describe("GET /api/knowledge/bases", () => {
  it("requires authentication", async () => {
    mockNoSession(auth);

    const response = await route.GET();
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns enabled knowledge bases without admin role", async () => {
    const user = await seedUser(prisma, { role: "user" });
    mockAuthSession(auth, { id: user.id, role: "user" });
    await prisma.knowledgeBase.create({
      data: { name: "Payments", slug: "payments", enabled: true, createdById: user.id },
    });
    await prisma.knowledgeBase.create({
      data: { name: "Disabled", slug: "disabled", enabled: false, createdById: user.id },
    });

    const response = await route.GET();
    const result = await readJson<{ knowledgeBases: Array<{ slug: string }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.knowledgeBases).toEqual([expect.objectContaining({ slug: "payments" })]);
  });
});
