import { execFileSync } from "node:child_process";
import { NextRequest } from "next/server";
import type { PrismaClient, Ticket, User } from "@prisma/client";
import type { Session } from "next-auth";
import type { Mock } from "vitest";

type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]>;

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

const defaultTestDatabaseUrl = "postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_test";

export function createTestDatabaseUrl(label: string): string {
  const baseUrl = process.env.TEST_DATABASE_URL || process.env.POSTGRES_DATABASE_URL || defaultTestDatabaseUrl;
  const url = new URL(baseUrl);
  const safeLabel = label.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24).toLowerCase();
  const suffix = Math.random().toString(36).slice(2, 8);
  url.searchParams.set("schema", `test_${safeLabel}_${process.pid}_${Date.now()}_${suffix}`);
  return url.toString();
}

export function pushTestDatabaseSchema(databaseUrl: string): void {
  const schemaName = getPostgresSchemaName(databaseUrl);
  runPrismaDbExecute(databaseUrl, `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
  execFileSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "db",
      "push",
      "--schema",
      "prisma/schema.prisma",
      "--skip-generate",
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    }
  );
}

export function removeTestDatabase(databaseUrl: string): void {
  const schemaName = getPostgresSchemaName(databaseUrl);
  runPrismaDbExecute(databaseUrl, `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
}

function getPostgresSchemaName(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error(`Test database URL must use PostgreSQL, received: ${url.protocol}`);
  }

  const schemaName = url.searchParams.get("schema");
  if (!schemaName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)) {
    throw new Error("Test database URL must include a safe PostgreSQL schema name.");
  }
  return schemaName;
}

function runPrismaDbExecute(databaseUrl: string, sql: string): void {
  const maintenanceUrl = new URL(databaseUrl);
  maintenanceUrl.searchParams.delete("schema");
  execFileSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "db",
      "execute",
      "--schema",
      "prisma/schema.prisma",
      "--stdin",
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: maintenanceUrl.toString() },
      input: sql,
      stdio: "pipe",
    }
  );
}

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.knowledgeSnippet.deleteMany();
  await prisma.knowledgeSourceVersion.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.aiProviderConfig.deleteMany();
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

export async function disconnectPrisma(prisma?: PrismaClient): Promise<void> {
  if (!prisma) return;
  await prisma.$disconnect();
  delete (globalThis as { prisma?: PrismaClient }).prisma;
}

function uniqueValue(prefix: string): string {
  return `${prefix}-${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export async function seedUser(
  prisma: PrismaClient,
  overrides: Partial<User> = {}
): Promise<User> {
  const username = overrides.username ?? uniqueValue("user");
  return prisma.user.create({
    data: {
      id: overrides.id,
      username,
      displayName: overrides.displayName ?? username,
      email: overrides.email ?? `${username}@example.test`,
      passwordHash: overrides.passwordHash ?? "test-password-hash",
      avatarUrl: overrides.avatarUrl ?? null,
      role: overrides.role ?? "user",
      department: overrides.department ?? null,
      createdAt: overrides.createdAt,
      updatedAt: overrides.updatedAt,
    },
  });
}

export async function seedTicket(
  prisma: PrismaClient,
  data: {
    creatorId: string;
    assigneeId?: string | null;
  } & Partial<Omit<Ticket, "creatorId" | "assigneeId">>
): Promise<Ticket> {
  return prisma.ticket.create({
    data: {
      id: data.id,
      title: data.title ?? uniqueValue("ticket"),
      description: data.description ?? "Test ticket description",
      type: data.type ?? "需求",
      priority: data.priority ?? "medium",
      status: data.status ?? "pending",
      creatorId: data.creatorId,
      assigneeId: data.assigneeId ?? null,
      dueDate: data.dueDate ?? null,
      closedAt: data.closedAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
  });
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
  const { headers, signal, ...rest } = init;
  const requestInit: NextRequestInit = {
    ...rest,
    method: rest.method ?? "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
  if (signal) requestInit.signal = signal;
  return new NextRequest(url, requestInit);
}

export function getRequest(url: string, init: RequestInit = {}): NextRequest {
  const { signal, ...rest } = init;
  const requestInit: NextRequestInit = { method: "GET", ...rest };
  if (signal) requestInit.signal = signal;
  return new NextRequest(url, requestInit);
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
