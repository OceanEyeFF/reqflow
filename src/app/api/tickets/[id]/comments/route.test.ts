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

type CommentsRoute = typeof import("./route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: CommentsRoute;
let creator: User;
let assignee: User;
let watcher: User;
let outsider: User;
let ticket: Ticket;

async function seedScenario() {
  creator = await seedUser(prisma, { id: "comment-creator", username: "comment-creator" });
  assignee = await seedUser(prisma, { id: "comment-assignee", username: "comment-assignee" });
  watcher = await seedUser(prisma, { id: "comment-watcher", username: "comment-watcher" });
  outsider = await seedUser(prisma, { id: "comment-outsider", username: "comment-outsider" });
  ticket = await seedTicket(prisma, {
    id: "comment-ticket",
    creatorId: creator.id,
    assigneeId: assignee.id,
    title: "Comment target",
  });
  await prisma.ticketMember.create({
    data: { ticketId: ticket.id, userId: watcher.id, role: "watcher" },
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("comments-route");
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

describe("GET /api/tickets/[id]/comments", () => {
  it("returns 401 when unauthenticated", async () => {
    mockNoSession(auth);

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/comments`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns comments in creation order", async () => {
    mockAuthSession(auth, { id: creator.id, role: "user" });
    await prisma.ticketComment.create({
      data: { ticketId: ticket.id, userId: creator.id, content: "First comment" },
    });
    await prisma.ticketComment.create({
      data: { ticketId: ticket.id, userId: assignee.id, content: "Second comment" },
    });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/comments`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ comments: Array<{ content: string }> }>(response);

    expect(result.status).toBe(200);
    expect(result.body.comments.map((comment) => comment.content)).toEqual([
      "First comment",
      "Second comment",
    ]);
  });

  it("rejects users who are not ticket participants", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/comments`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权访问该工单" } });
  });
});

describe("POST /api/tickets/[id]/comments", () => {
  it("rejects empty content", async () => {
    mockAuthSession(auth, { id: watcher.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/comments`, { content: "   " }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "评论内容不能为空" } });
  });

  it("creates a comment and notifies ticket participants except the commenter", async () => {
    mockAuthSession(auth, { id: watcher.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/comments`, {
        content: "  Created from route test  ",
      }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ comment: { content: string; userId: string } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.comment).toMatchObject({
      content: "Created from route test",
      userId: watcher.id,
    });
    await expect(
      prisma.notification.findMany({
        where: { ticketId: ticket.id, type: "new_comment" },
        select: { userId: true },
        orderBy: { userId: "asc" },
      })
    ).resolves.toEqual([
      { userId: assignee.id },
      { userId: creator.id },
    ]);
  });

  it("rejects comment creation from users who are not ticket participants", async () => {
    mockAuthSession(auth, { id: outsider.id, role: "user" });

    const response = await route.POST(
      jsonRequest(`http://localhost/api/tickets/${ticket.id}/comments`, {
        content: "Outsider comment",
      }),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权访问该工单" } });
  });
});
