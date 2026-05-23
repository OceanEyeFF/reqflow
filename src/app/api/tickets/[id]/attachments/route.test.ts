import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient, Ticket, User } from "@prisma/client";
import type { auth as authFn } from "@/auth";
import {
  clearDatabase,
  createTestDatabaseUrl,
  disconnectPrisma,
  getRequest,
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

type AttachmentsRoute = typeof import("./route");

let databaseUrl: string;
let prisma: PrismaClient;
let auth: ReturnType<typeof vi.mocked<typeof authFn>>;
let route: AttachmentsRoute;
let uploader: User;
let otherUser: User;
let ticket: Ticket;
let createdUploadPaths: string[] = [];

function uploadPathFromUrl(fileUrl: string): string {
  return path.join(process.cwd(), "public", fileUrl);
}

function trackUpload(fileUrl: string): string {
  const filePath = uploadPathFromUrl(fileUrl);
  createdUploadPaths.push(filePath);
  return filePath;
}

function cleanupUploads() {
  for (const filePath of createdUploadPaths) {
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }
  createdUploadPaths = [];
}

function formRequest(url: string, formData: FormData): NextRequest {
  return new NextRequest(url, { method: "POST", body: formData });
}

function formWithFile(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

async function seedScenario() {
  uploader = await seedUser(prisma, { id: "attachment-uploader", username: "attachment-uploader" });
  otherUser = await seedUser(prisma, { id: "attachment-other", username: "attachment-other" });
  ticket = await seedTicket(prisma, {
    id: "attachment-ticket",
    creatorId: uploader.id,
    title: "Attachment target",
  });
}

beforeAll(async () => {
  databaseUrl = createTestDatabaseUrl("attachments-route");
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
  cleanupUploads();
  await clearDatabase(prisma);
  await seedScenario();
});

afterAll(async () => {
  cleanupUploads();
  await disconnectPrisma(prisma);
  removeTestDatabase(databaseUrl);
});

describe("GET /api/tickets/[id]/attachments", () => {
  it("returns 401 when unauthenticated", async () => {
    mockNoSession(auth);

    const response = await route.GET(
      getRequest(`http://localhost/api/tickets/${ticket.id}/attachments`),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 401, body: { error: "未登录" } });
  });

  it("returns 404 for a missing ticket", async () => {
    mockAuthSession(auth, { id: uploader.id, role: "user" });

    const response = await route.GET(
      getRequest("http://localhost/api/tickets/missing/attachments"),
      routeParams({ id: "missing" })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 404, body: { error: "工单不存在" } });
  });
});

describe("POST /api/tickets/[id]/attachments", () => {
  it("rejects requests without a file", async () => {
    mockAuthSession(auth, { id: uploader.id, role: "user" });

    const response = await route.POST(
      formRequest(`http://localhost/api/tickets/${ticket.id}/attachments`, new FormData()),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 400, body: { error: "未提供文件" } });
  });

  it("uploads an allowed file and persists its metadata", async () => {
    mockAuthSession(auth, { id: uploader.id, role: "user" });
    const file = new File(["attachment body"], "route-test.pdf", { type: "application/pdf" });

    const response = await route.POST(
      formRequest(`http://localhost/api/tickets/${ticket.id}/attachments`, formWithFile(file)),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{
      attachment: { id: string; filename: string; fileUrl: string; userId: string };
    }>(response);
    const filePath = trackUpload(result.body.attachment.fileUrl);

    expect(result.status).toBe(201);
    expect(result.body.attachment).toMatchObject({
      filename: "route-test.pdf",
      userId: uploader.id,
    });
    expect(existsSync(filePath)).toBe(true);
    await expect(
      prisma.ticketAttachment.findUnique({ where: { id: result.body.attachment.id } })
    ).resolves.toBeTruthy();
  });
});

describe("DELETE /api/tickets/[id]/attachments", () => {
  async function seedAttachment() {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    mkdirSync(uploadsDir, { recursive: true });
    const fileName = `route-test-${Date.now()}.pdf`;
    const fileUrl = `/uploads/${fileName}`;
    const filePath = trackUpload(fileUrl);
    writeFileSync(filePath, "attachment body");

    return prisma.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        userId: uploader.id,
        filename: "route-test.pdf",
        fileUrl,
        fileSize: 15,
        mimeType: "application/pdf",
      },
    });
  }

  it("rejects users who do not own the attachment", async () => {
    const attachment = await seedAttachment();
    mockAuthSession(auth, { id: otherUser.id, role: "user" });

    const response = await route.DELETE(
      getRequest(
        `http://localhost/api/tickets/${ticket.id}/attachments?attachmentId=${attachment.id}`,
        { method: "DELETE" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ error: string }>(response);

    expect(result).toEqual({ status: 403, body: { error: "无权删除该附件" } });
    expect(existsSync(uploadPathFromUrl(attachment.fileUrl))).toBe(true);
  });

  it("deletes the attachment record and physical file for the uploader", async () => {
    const attachment = await seedAttachment();
    mockAuthSession(auth, { id: uploader.id, role: "user" });

    const response = await route.DELETE(
      getRequest(
        `http://localhost/api/tickets/${ticket.id}/attachments?attachmentId=${attachment.id}`,
        { method: "DELETE" }
      ),
      routeParams({ id: ticket.id })
    );
    const result = await readJson<{ success: boolean }>(response);

    expect(result).toEqual({ status: 200, body: { success: true } });
    expect(existsSync(uploadPathFromUrl(attachment.fileUrl))).toBe(false);
    await expect(prisma.ticketAttachment.findUnique({ where: { id: attachment.id } })).resolves.toBeNull();
  });
});
