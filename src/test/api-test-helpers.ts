import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { Mock } from "vitest";

export type TestSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string;
  role?: string;
  department?: string | null;
  avatarUrl?: string | null;
};

export type JsonResponse<T> = {
  status: number;
  body: T;
};

const testDbDir = path.join(process.cwd(), "prisma", "test-dbs");

export function createTestDatabaseUrl(label: string): string {
  mkdirSync(testDbDir, { recursive: true });
  const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48);
  return `file:./test-dbs/${safeLabel}-${process.pid}-${Date.now()}.db`;
}

export function pushTestDatabaseSchema(databaseUrl: string): void {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(
    npx,
    ["prisma", "db", "push", "--schema", "prisma/schema.prisma", "--skip-generate"],
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    }
  );
}

export function removeTestDatabase(databaseUrl: string): void {
  const prefix = "file:./test-dbs/";
  if (!databaseUrl.startsWith(prefix)) return;

  const dbName = databaseUrl.slice(prefix.length);
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const filePath = path.join(testDbDir, `${dbName}${suffix}`);
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }
}

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.notification.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketMember.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

export function createMockSession(user: TestSessionUser): Session {
  return {
    expires: "2026-01-01T00:00:00.000Z",
    user: {
      id: user.id,
      name: user.name ?? "Test User",
      email: user.email ?? `${user.id}@example.test`,
      username: user.username ?? user.id,
      role: user.role ?? "user",
      department: user.department ?? null,
      avatarUrl: user.avatarUrl ?? null,
    },
  } as Session;
}

export function mockAuthSession(authMock: Mock, user: TestSessionUser): Session {
  const session = createMockSession(user);
  authMock.mockResolvedValue(session);
  return session;
}

export function mockNoSession(authMock: Mock): void {
  authMock.mockResolvedValue(null);
}

export function mockAuthFailure(authMock: Mock): void {
  authMock.mockRejectedValue(new Error("未登录"));
}

export async function importRouteFresh<T>(loader: () => Promise<T>): Promise<T> {
  return loader();
}

export function jsonRequest(
  url: string,
  body: unknown,
  init: Omit<RequestInit, "body"> = {}
): NextRequest {
  return new NextRequest(url, {
    method: init.method ?? "POST",
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
    body: JSON.stringify(body),
  });
}

export function getRequest(url: string, init: RequestInit = {}): NextRequest {
  return new NextRequest(url, { method: "GET", ...init });
}

export function routeParams<T extends Record<string, string>>(params: T): {
  params: Promise<T>;
} {
  return { params: Promise.resolve(params) };
}

export async function readJson<T>(response: Response): Promise<JsonResponse<T>> {
  return {
    status: response.status,
    body: (await response.json()) as T,
  };
}
