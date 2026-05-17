import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    include: {
      ticket: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { notificationIds } = body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    return Response.json({ error: "无效的通知ID列表" }, { status: 400 });
  }

  // Mark all specified notifications as read
  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId: session.user.id,
    },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}