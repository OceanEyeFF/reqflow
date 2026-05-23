import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient, User } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  getRequest,
  jsonRequest,
  mockAuthSession,
  mockNoSession,
  pushTestDatabaseSchema,
  readJson,
  removeTestDatabase,
  seedTicket,
  seedUser,
} from "@/test/api-test-helpers";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

type TicketsRoute = typeof import("./route");
type StatsRoute = typeof import("./stats/route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let ticketsRoute: TicketsRoute;
let statsRoute: StatsRoute;
let admin: User;
let user: User;

async function seedUsers() {
  admin = await seedUser(prisma, { id: "admin-user", username: "admin-user", role: "admin" });
  user = await seedUser(prisma, { id: "regular-user", username: "regular-user", role: "user" });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("tickets-route");
  process.env.DATABASE_URL = databaseUrl;
  pushTestDatabaseSchema(databaseUrl);
  vi.resetModules();

  const authModule = await import("@/auth");
  auth = vi.mocked(authModule.auth);
  ({ prisma } = await import("@/lib/prisma"));
  ticketsRoute = await import("./route");
  statsRoute = await import("./stats/route");
});

beforeEach(async () => {
  auth.mockReset();
  await clearDatabase(prisma);
  await seedUsers();
});

afterAll(async () => {
  await disconnectPrisma(prisma);
  removeTestDatabase(databaseUrl);
});

describe("GET /api/tickets", () => {
  it("returns 401 when unauthenticated", async () => {
    mockNoSession(auth);

    const response = await ticketsRoute.GET(getRequest("http://localhost/api/tickets"));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns all tickets for admin scope=all", async () => {
    mockAuthSession(auth, { id: admin.id, role: "admin" });
    await seedTicket(prisma, { creatorId: user.id, title: "Created by user" });
    await seedTicket(prisma, { creatorId: admin.id, title: "Created by admin" });

    const response = await ticketsRoute.GET(getRequest("http://localhost/api/tickets?scope=all"));
    const result = await readJson<{ tickets: Array<{ title: string }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.tickets).toHaveLength(2);
    expect(result.body.tickets.map((ticket) => ticket.title).sort()).toEqual([
      "Created by admin",
      "Created by user",
    ]);
  });
});

describe("POST /api/tickets", () => {
  it("rejects an empty title", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await ticketsRoute.POST(jsonRequest("http://localhost/api/tickets", { title: "  " }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "标题不能为空" } });
  });

  it("creates a ticket and creation log", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await ticketsRoute.POST(
      jsonRequest("http://localhost/api/tickets", {
        title: "Route test ticket",
        description: "Created from route test",
        priority: "high",
        type: "需求",
      })
    );
    const result = await readJson<{ ticket: { id: string; title: string; creatorId: string } }>(
      response
    );

    expect(result.status).toBe(200);
    expect(result.body.ticket).toMatchObject({
      title: "Route test ticket",
      creatorId: user.id,
    });
    await expect(
      prisma.ticketLog.findFirst({
        where: { ticketId: result.body.ticket.id, action: "created", userId: user.id },
      })
    ).resolves.toBeTruthy();
  });
});

describe("GET /api/tickets/stats", () => {
  it("returns scoped counts for the current user", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    const assigned = await seedTicket(prisma, {
      creatorId: admin.id,
      assigneeId: user.id,
      priority: "urgent",
    });
    await prisma.ticketMember.create({
      data: { ticketId: assigned.id, userId: user.id, role: "collaborator" },
    });
    await seedTicket(prisma, { creatorId: user.id, status: "waiting_feedback" });

    const response = await statsRoute.GET();
    const result = await readJson<{
      stats: { assigned: number; created: number; involved: number; waiting: number; urgent: number };
    }>(response);

    expect(result.status).toBe(200);
    expect(result.body.stats).toEqual({
      assigned: 1,
      created: 1,
      involved: 1,
      waiting: 0,
      urgent: 1,
    });
  });
});
