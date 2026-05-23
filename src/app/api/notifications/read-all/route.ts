import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const session = await requireAuth();

    // Mark all unread notifications as read for this user
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Handler error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}