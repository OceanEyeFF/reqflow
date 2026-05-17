import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  // Verify notification exists and belongs to the user
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return Response.json({ error: "通知不存在" }, { status: 404 });
  }

  if (notification.userId !== session.user.id) {
    return Response.json({ error: "无权操作此通知" }, { status: 403 });
  }

  // Mark as read
  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return Response.json({ notification: updated });
}