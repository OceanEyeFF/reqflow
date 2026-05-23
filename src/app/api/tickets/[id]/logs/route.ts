import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;

    const logs = await prisma.ticketLog.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ logs });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Logs GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
