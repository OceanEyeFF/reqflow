import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  jsonRequest,
  mockAuthSession,
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
  await clearDatabase(prisma);
});

describe("PATCH /api/admin/knowledge/sources/[id]", () => {
  it("enables ready sources and marks enabled status", async () => {
    const admin = await seedUser(prisma, { role: "admin" });
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    const source = await prisma.knowledgeSource.create({
      data: { title: "Guide", status: "ready", enabled: false, createdById: admin.id },
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
    const source = await prisma.knowledgeSource.create({
      data: { title: "Guide", status: "uploaded", enabled: false, createdById: admin.id },
    });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/admin/knowledge/sources/${source.id}`, { enabled: true }, { method: "PATCH" }),
      routeParams({ id: source.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "只能启用已解析成功的知识来源" } });
  });
});
