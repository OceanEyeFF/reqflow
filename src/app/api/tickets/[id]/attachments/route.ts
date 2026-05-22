import { NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTicket } from "@/lib/ticket-access";

const ALLOWED_MIME_TYPES = [
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];

const ALLOWED_EXTENSIONS = [".txt", ".doc", ".docx", ".xls", ".xlsx", ".zip"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");

function isAllowedType(mimeType: string, filename: string): boolean {
  if (ALLOWED_MIME_TYPES.includes(mimeType)) {
    return true;
  }
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
  return UPLOADS_DIR;
}

function getStoredFilePath(fileUrl: string) {
  return path.join(UPLOADS_DIR, path.basename(fileUrl));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  // Check if ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权查看该工单附件" }, { status: 403 });
  }

  const attachments = await prisma.ticketAttachment.findMany({
    where: { ticketId: id },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ attachments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  // Check if ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权上传该工单附件" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "无效的表单数据" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "未提供文件" }, { status: 400 });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "文件大小超过10MB限制" }, { status: 400 });
  }

  // Check file type
  if (!isAllowedType(file.type, file.name)) {
    return Response.json(
      { error: "不支持的文件类型" },
      { status: 400 }
    );
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const ext = path.extname(file.name);
  const uniqueFilename = `${timestamp}-${randomStr}${ext}`;

  // Ensure uploads directory exists
  const uploadsDir = await ensureUploadsDir();
  const filePath = path.join(uploadsDir, uniqueFilename);

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${uniqueFilename}`;
  try {
    const attachment = await prisma.ticketAttachment.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        filename: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    return Response.json({ attachment }, { status: 201 });
  } catch {
    await unlink(filePath).catch(() => undefined);
    return Response.json({ error: "附件保存失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const attachmentId = url.searchParams.get("attachmentId");

  if (!attachmentId) {
    return Response.json({ error: "未提供附件ID" }, { status: 400 });
  }

  const attachment = await prisma.ticketAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    return Response.json({ error: "附件不存在" }, { status: 404 });
  }

  if (attachment.ticketId !== id) {
    return Response.json({ error: "附件不属于该工单" }, { status: 400 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权访问该工单附件" }, { status: 403 });
  }

  // Only the uploader can delete their own attachments (or admin)
  if (attachment.userId !== session.user.id && session.user.role !== "admin") {
    return Response.json({ error: "无权删除该附件" }, { status: 403 });
  }

  // Delete physical file
  const filePath = getStoredFilePath(attachment.fileUrl);
  try {
    await unlink(filePath);
  } catch {
    // File may already be deleted, continue with DB deletion
  }

  // Delete database record
  await prisma.ticketAttachment.delete({ where: { id: attachmentId } });

  return Response.json({ success: true });
}
