import type { Session } from "next-auth";
import { AuthError, requireAuth } from "@/lib/auth-helper";

export class AdminAuthError extends Error {
  constructor(message: string = "需要管理员权限") {
    super(message);
  }
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new AdminAuthError();
  }
  return session;
}

export function adminAuthErrorResponse(error: unknown): Response | null {
  if (error instanceof AuthError || (error instanceof Error && error.message === "未登录")) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }
  if (error instanceof AdminAuthError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  return null;
}
