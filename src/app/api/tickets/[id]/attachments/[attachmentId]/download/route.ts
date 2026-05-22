import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTicket } from "@/lib/ticket-access";

const UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");

function contentDisposition(filename: string) {
  const fallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id, attachmentId } = await params;
  const attachment = await prisma.ticketAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment || attachment.ticketId !== id) {
    return Response.json({ error: "附件不存在" }, { status: 404 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权下载该工单附件" }, { status: 403 });
  }

  try {
    const filePath = path.join(UPLOADS_DIR, path.basename(attachment.fileUrl));
    const file = await readFile(filePath);

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(file.length),
        "Content-Disposition": contentDisposition(attachment.filename),
      },
    });
  } catch {
    return Response.json({ error: "附件文件不存在" }, { status: 404 });
  }
}
