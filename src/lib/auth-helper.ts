import { auth } from "@/auth";
import { Session } from "next-auth";

export class AuthError extends Error {
  constructor(message: string = "未登录") {
    super(message);
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("未登录");
  }
  return session;
}
