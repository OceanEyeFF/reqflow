import { describe, it, expect, vi } from "vitest";
import {
  createMockSession,
  createTestDatabaseUrl,
  getRequest,
  jsonRequest,
  mockAuthFailure,
  mockAuthSession,
  mockNoSession,
  readJson,
  routeParams,
} from "./api-test-helpers";

describe("api-test-helpers", () => {
  it("creates isolated Prisma PostgreSQL schema URLs", () => {
    const url = createTestDatabaseUrl("tickets route");
    const parsed = new URL(url);

    expect(parsed.protocol).toBe("postgresql:");
    expect(parsed.searchParams.get("schema")).toMatch(/^test_tickets_route_\d+_\d+_[a-z0-9]+$/);
  });

  it("creates mock NextAuth-compatible sessions", () => {
    const session = createMockSession({ id: "user-1", role: "admin" });

    expect(session.user.id).toBe("user-1");
    expect(session.user.role).toBe("admin");
    expect(session.user.email).toBe("user-1@example.test");
  });

  it("configures authenticated and unauthenticated auth mocks", async () => {
    const auth = vi.fn();
    const session = mockAuthSession(auth, { id: "manager-1" });

    await expect(auth()).resolves.toBe(session);

    mockNoSession(auth);
    await expect(auth()).resolves.toBeNull();

    mockAuthFailure(auth);
    await expect(auth()).rejects.toThrow("未登录");
  });

  it("builds NextRequest instances and route params for route handlers", async () => {
    const post = jsonRequest("http://localhost/api/tickets", { title: "T" });
    const get = getRequest("http://localhost/api/tickets?scope=all");
    const params = routeParams({ id: "ticket-1" });

    expect(post.method).toBe("POST");
    await expect(post.json()).resolves.toEqual({ title: "T" });
    expect(get.method).toBe("GET");
    await expect(params.params).resolves.toEqual({ id: "ticket-1" });
  });

  it("reads typed JSON responses", async () => {
    const result = await readJson<{ ok: boolean }>(Response.json({ ok: true }, { status: 201 }));

    expect(result).toEqual({ status: 201, body: { ok: true } });
  });
});
