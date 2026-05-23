import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

// Mock the @/auth module before importing the module under test
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { AuthError, requireAuth } from "./auth-helper";
import { auth } from "@/auth";

const mockedAuth = vi.mocked(auth);

function makeSession(userExists = true): Session {
  const session: Session = {
    expires: "2026-01-01T00:00:00.000Z",
  };
  if (userExists) {
    (session as Record<string, unknown>).user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    };
  }
  return session;
}

describe("AuthError", () => {
  it("should be an instance of Error", () => {
    const err = new AuthError();
    expect(err).toBeInstanceOf(Error);
  });

  it("should have default message '未登录'", () => {
    const err = new AuthError();
    expect(err.message).toBe("未登录");
  });

  it("should accept a custom message", () => {
    const err = new AuthError("自定义错误信息");
    expect(err.message).toBe("自定义错误信息");
  });

  it("should have the name AuthError", () => {
    const err = new AuthError();
    expect(err.constructor.name).toBe("AuthError");
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return session when auth returns a valid session", async () => {
    const session = makeSession(true);
    mockedAuth.mockResolvedValue(session);

    const result = await requireAuth();
    expect(result).toBe(session);
    expect(mockedAuth).toHaveBeenCalledOnce();
  });

  it("should throw AuthError when auth returns null", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow("未登录");
  });

  it("should throw AuthError when auth returns undefined", async () => {
    mockedAuth.mockResolvedValue(undefined);

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow("未登录");
  });

  it("should throw AuthError when session has no user", async () => {
    const session = makeSession(false);
    mockedAuth.mockResolvedValue(session);

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow("未登录");
  });
});
