import { describe, expect, it, vi } from "vitest";
import { mockAuthSession, mockNoSession, readJson, routeParams } from "@/test/api-test-helpers";
import type { auth as authFn } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const parseKnowledgeSourceVersion = vi.fn();

vi.mock("@/lib/knowledge/parser", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/knowledge/parser")>();
  return {
    ...actual,
    parseKnowledgeSourceVersion,
  };
});

type Route = typeof import("./route");

describe("POST /api/admin/knowledge/versions/[id]/parse", () => {
  it("requires admin auth and invokes parser", async () => {
    const authModule = await import("@/auth");
    const auth = vi.mocked<typeof authFn>(authModule.auth);
    auth.mockReset();
    mockAuthSession(auth, { id: "admin-1", role: "admin" });
    parseKnowledgeSourceVersion.mockResolvedValue({ snippetCount: 2 });
    const route: Route = await import("./route");

    const response = await route.POST(new Request("http://localhost/api/admin/knowledge/versions/v1/parse"), routeParams({ id: "v1" }));
    const result = await readJson<{ snippetCount: number }>(response);

    expect(result).toEqual({ status: 200, body: { snippetCount: 2 } });
    expect(parseKnowledgeSourceVersion).toHaveBeenCalledWith("v1");
  });

  it("rejects unauthenticated requests", async () => {
    const authModule = await import("@/auth");
    const auth = vi.mocked<typeof authFn>(authModule.auth);
    auth.mockReset();
    mockNoSession(auth);
    const route: Route = await import("./route");

    const response = await route.POST(new Request("http://localhost/api/admin/knowledge/versions/v1/parse"), routeParams({ id: "v1" }));
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });
});
