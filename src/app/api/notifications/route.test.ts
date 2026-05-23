import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Notification, PrismaClient, Ticket, User } from "@prisma/client";
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

type NotificationsRoute = typeof import("./route");
type NotificationRoute = typeof import("./[id]/route");
type ReadAllRoute = typeof import("./read-all/route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: NotificationsRoute;
let itemRoute: NotificationRoute;
let readAllRoute: ReadAllRoute;
let user: User;
let otherUser: User;
let ticket: Ticket;

async function seedScenario() {
  user = await seedUser(prisma, { id: "notification-user", username: "notification-user" });
  otherUser = await seedUser(prisma, { id: "notification-other", username: "notification-other" });
  ticket = await seedTicket(prisma, {
    id: "notification-ticket",
    creatorId: user.id,
    title: "Notification target",
  });
}

async function seedNotification(
  owner: User,
  overrides: Partial<Notification> = {}
): Promise<Notification> {
  return prisma.notification.create({
    data: {
      id: overrides.id,
      userId: owner.id,
      type: overrides.type ?? "new_comment",
      title: overrides.title ?? "Test notification",
      content: overrides.content ?? "Notification content",
      ticketId: overrides.ticketId === undefined ? ticket.id : overrides.ticketId,
      isRead: overrides.isRead ?? false,
      createdAt: overrides.createdAt,
    },
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("notifications-route");
  process.env.DATABASE_URL = databaseUrl;
  pushTestDatabaseSchema(databaseUrl);
  vi.resetModules();

  const authModule = await import("@/auth");
  auth = vi.mocked(authModule.auth);
  ({ prisma } = await import("@/lib/prisma"));
  route = await import("./route");
  itemRoute = await import("./[id]/route");
  readAllRoute = await import("./read-all/route");
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

describe("GET /api/notifications", () => {
  it("returns 401 when unauthenticated", async () => {
    mockNoSession(auth);

    const response = await route.GET(getRequest("http://localhost/api/notifications"));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns unread notifications for the current user", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    await seedNotification(user, {
      id: "read-notification",
      isRead: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    await seedNotification(user, {
      id: "unread-notification",
      isRead: false,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    await seedNotification(otherUser, { id: "other-notification", isRead: false });

    const response = await route.GET(getRequest("http://localhost/api/notifications?unread=true"));
    const result = await readJson<{
      notifications: Array<{ id: string; ticket: { id: string } | null }>;
      unreadCount: number;
    }>(response);

    expect(result.status).toBe(200);
    expect(result.body.unreadCount).toBe(1);
    expect(result.body.notifications).toEqual([
      expect.objectContaining({
        id: "unread-notification",
        ticket: expect.objectContaining({ id: ticket.id }),
      }),
    ]);
  });
});

describe("PATCH /api/notifications", () => {
  it("rejects invalid notification id lists", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });

    const response = await route.PATCH(
      jsonRequest("http://localhost/api/notifications", { notificationIds: "not-an-array" }, { method: "PATCH" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "无效的通知ID列表" } });
  });

  it("marks only the current user's specified notifications as read", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    const own = await seedNotification(user, { id: "own-unread", isRead: false });
    const other = await seedNotification(otherUser, { id: "other-unread", isRead: false });

    const response = await route.PATCH(
      jsonRequest(
        "http://localhost/api/notifications",
        { notificationIds: [own.id, other.id] },
        { method: "PATCH" }
      )
    );
    const result = await readJson<{ success: boolean }>(response);

    expect(result).toEqual({ status: 200, body: { success: true } });
    await expect(prisma.notification.findUnique({ where: { id: own.id } })).resolves.toMatchObject({
      isRead: true,
    });
    await expect(prisma.notification.findUnique({ where: { id: other.id } })).resolves.toMatchObject({
      isRead: false,
    });
  });
});

describe("PATCH /api/notifications/[id]", () => {
  it("rejects notifications owned by another user", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    const other = await seedNotification(otherUser, { id: "other-owned", isRead: false });

    const response = await itemRoute.PATCH(
      jsonRequest(`http://localhost/api/notifications/${other.id}`, {}, { method: "PATCH" }),
      routeParams({ id: other.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权操作此通知" } });
  });

  it("marks a single notification as read", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    const notification = await seedNotification(user, { id: "single-unread", isRead: false });

    const response = await itemRoute.PATCH(
      jsonRequest(`http://localhost/api/notifications/${notification.id}`, {}, { method: "PATCH" }),
      routeParams({ id: notification.id })
    );
    const result = await readJson<{ notification: { id: string; isRead: boolean } }>(response);

    expect(result.status).toBe(200);
    expect(result.body.notification).toMatchObject({ id: notification.id, isRead: true });
  });
});

describe("PATCH /api/notifications/read-all", () => {
  it("marks all unread notifications for the current user as read", async () => {
    mockAuthSession(auth, { id: user.id, role: "user" });
    const first = await seedNotification(user, { id: "read-all-first", isRead: false });
    const second = await seedNotification(user, { id: "read-all-second", isRead: false });
    const other = await seedNotification(otherUser, { id: "read-all-other", isRead: false });

    const response = await readAllRoute.PATCH();
    const result = await readJson<{ success: boolean }>(response);

    expect(result).toEqual({ status: 200, body: { success: true } });
    await expect(
      prisma.notification.findMany({
        where: { id: { in: [first.id, second.id] } },
        select: { id: true, isRead: true },
        orderBy: { id: "asc" },
      })
    ).resolves.toEqual([
      { id: first.id, isRead: true },
      { id: second.id, isRead: true },
    ]);
    await expect(prisma.notification.findUnique({ where: { id: other.id } })).resolves.toMatchObject({
      isRead: false,
    });
  });
});
