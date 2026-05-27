import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

type MembersRoute = typeof import("./route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: MembersRoute;
let creator: User;
let assignee: User;
let collaborator: User;
let outsider: User;
let target: User;
let ticket: Ticket;

async function seedScenario() {
  creator = await seedUser(prisma, { id: "member-creator", username: "member-creator" });
  assignee = await seedUser(prisma, { id: "member-assignee", username: "member-assignee" });
  collaborator = await seedUser(prisma, { id: "member-collaborator", username: "member-collaborator" });
  outsider = await seedUser(prisma, { id: "member-outsider", username: "member-outsider" });
  target = await seedUser(prisma, { id: "member-target", username: "member-target" });
  ticket = await seedTicket(prisma, {
    id: "member-ticket",
    creatorId: creator.id,
    assigneeId: assignee.id,
    title: "Member target",
  });
  await prisma.ticketMember.create({
    data: { ticketId: ticket.id, userId: collaborator.id, role: "collaborator" },
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("members-route");
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

describe("GET /api/tickets/[id]/members", () => {
  it("returns ticket members", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/members`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ members: Array<{ userId: string; role: string }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.members).toEqual([
      expect.objectContaining({ userId: collaborator.id, role: "collaborator" }),
    ]);
  });

  it("rejects users who are not ticket participants", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/members`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权访问该工单" } });
  });
});

describe("POST /api/tickets/[id]/members", () => {
  it("rejects missing userId", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/members`, { role: "watcher" }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "用户ID不能为空" } });
  });

  it("rejects users without member-management permission", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/members`, {
        userId: target.id,
        role: "watcher",
      }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result.status).toBe(403);
    expect(result.body.error).toContain("只有工单创建者");
  });

  it("adds a member and writes log and notification side effects", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/members`, {
        userId: target.id,
        role: "watcher",
      }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ member: { userId: string; role: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.member).toMatchObject({ userId: target.id, role: "watcher" });
    await expect(
      prisma.ticketLog.findFirst({
        where: { ticketId: ticket.id, userId: creator.id, action: "member_added" },
      })
    ).resolves.toBeTruthy();
    await expect(
      prisma.notification.findFirst({
        where: { ticketId: ticket.id, userId: target.id, type: "member_added" },
      })
    ).resolves.toBeTruthy();
  });
});

describe("DELETE /api/tickets/[id]/members", () => {
  it("returns 404 when the member does not exist", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.DELETE(
      getRequest(`http://localhost/api/tickets/${ticket.id}/members?userId=${target.id}`, {
        method: "DELETE",
      }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 404, body: { error: "协作者不存在" } });
  });
});

describe("PATCH /api/tickets/[id]/members", () => {
  it("rejects invalid roles", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest(
        `http://localhost/api/tickets/${ticket.id}/members?userId=${collaborator.id}`,
        { role: "invalid-role" },
        { method: "PATCH" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result.status).toBe(400);
    expect(result.body.error).toContain("角色必须是以下之一");
  });

  it("updates a member role and writes a log entry", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest(
        `http://localhost/api/tickets/${ticket.id}/members?userId=${collaborator.id}`,
        { role: "owner" },
        { method: "PATCH" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ member: { userId: string; role: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.member).toMatchObject({ userId: collaborator.id, role: "owner" });
    await expect(
      prisma.ticketLog.findFirst({
        where: { ticketId: ticket.id, userId: creator.id, action: "member_role_changed" },
      })
    ).resolves.toBeTruthy();
  });
});
