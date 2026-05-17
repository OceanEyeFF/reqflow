import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  // Mark all unread notifications as read for this user
  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}