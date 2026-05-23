import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient, Ticket, User } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  getRequest,
  mockAuthSession,
  mockNoSession,
  pushTestDatabaseSchema,
  readJson,
  removeTestDatabase,
  routeParams,
  seedTicket,
  seedUser,
} from "@/test/api-test-helpers";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

type LogsRoute = typeof import("./route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: LogsRoute;
let user: User;
let ticket: Ticket;

async function seedScenario() {
  user = await seedUser(prisma, { id: "logs-user", username: "logs-user" });
  ticket = await seedTicket(prisma, {
    id: "logs-ticket",
    creatorId: user.id,
    title: "Logs target",
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("logs-route");
  process.env.DATABASE_URL = databaseUrl;
  pushTestDatabaseSchema(databaseUrl);
  vi.resetModules();

  const authModule = await import("@/auth");
  auth = vi.mocked(authModule.auth);
  ({ prisma } = await import("@/lib/prisma"));
  route = await import("./route");
});

beforeEach(async () => {
  auth.mockReset();
  await clearDatabase(prisma);
  await seedScenario();
});

afterAll(async () => {
  await disconnectPrisma(prisma);
  removeTestDatabase(databaseUrl);
});

describe("GET /api/tickets/[id]/logs", () => {
  it("returns 401 when unauthenticated", async () => {
    mockNoSession(auth);

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/logs`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns logs newest first", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        action: "created",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        action: "status_changed",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/logs`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ logs: Array<{ action: string }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.logs.map((log) => log.action)).toEqual(["status_changed", "created"]);
  });
});
