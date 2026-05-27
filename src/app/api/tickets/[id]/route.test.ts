import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient, Ticket, User } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  getRequest,
  jsonRequest,
  mockAuthSession,
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

type TicketRoute = typeof import("./route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: TicketRoute;
let admin: User;
let user: User;
let outsider: User;
let ticket: Ticket;

async function seedScenario() {
  admin = await seedUser(prisma, { id: "admin-user", username: "admin-user", role: "admin" });
  user = await seedUser(prisma, { id: "regular-user", username: "regular-user", role: "user" });
  outsider = await seedUser(prisma, { id: "outsider-user", username: "outsider-user", role: "user" });
  ticket = await seedTicket(prisma, {
    id: "ticket-1",
    creatorId: user.id,
    assigneeId: admin.id,
    title: "Ticket detail",
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("ticket-detail-route");
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

describe("GET /api/tickets/[id]", () => {
  it("returns ticket details", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ ticket: { id: string; title: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.ticket).toMatchObject({ id: ticket.id, title: "Ticket detail" });
  });

  it("returns 404 for a missing ticket", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.GET(
      getRequest("http://localhost/api/tickets/missing"),
      routeParams({ id: "missing" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 404, body: { error: "工单不存在" } });
  });

  it("rejects users who are not ticket participants", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权访问该工单" } });
  });
});

describe("PATCH /api/tickets/[id]", () => {
  it("rejects an invalid status", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}`, { status: "bad-status" }, { method: "PATCH" }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "无效的状态值" } });
  });

  it("updates status and writes a log entry", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest(
        `http://localhost/api/tickets/${ticket.id}`,
        { status: "processing" },
        { method: "PATCH" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ ticket: { id: string; status: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.ticket.status).toBe("processing");
    await expect(
      prisma.ticketLog.findFirst({
        where: { ticketId: ticket.id, action: "status_changed", oldValue: "pending", newValue: "processing" },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects updates from users who are not ticket participants", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest(
        `http://localhost/api/tickets/${ticket.id}`,
        { status: "processing" },
        { method: "PATCH" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权访问该工单" } });
  });
});

describe("DELETE /api/tickets/[id]", () => {
  it("rejects non-admin users", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.DELETE(
      getRequest(`http://localhost/api/tickets/${ticket.id}`, { method: "DELETE" }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "需要管理员权限" } });
  });

  it("deletes a ticket for admin users", async () => {
    mockAuthSession(auth, { id: admin.id, role: "admin" });

    const response = await route.DELETE(
      getRequest(`http://localhost/api/tickets/${ticket.id}`, { method: "DELETE" }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ success: boolean }>(response);

    expect(result).toEqual({ status: 200, body: { success: true } });
    await expect(prisma.ticket.findUnique({ where: { id: ticket.id } })).resolves.toBeNull();
  });
});
