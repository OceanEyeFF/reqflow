import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";

export async function GET() {
  try {
    const session = await requireAuth();

    const isAdmin = session.user.role === "admin";

    const baseWhereClause = isAdmin
      ? {}
      : {
          OR: [
            { creatorId: session.user.id },
            { assigneeId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        };

    const [assigned, created, involved, waiting, urgent] = await Promise.all([
      prisma.ticket.count({
        where: { ...baseWhereClause, assigneeId: session.user.id, status: { notIn: ["closed", "completed"] } },
      }),
      prisma.ticket.count({ where: { ...baseWhereClause, creatorId: session.user.id } }),
      prisma.ticket.count({
        where: { members: { some: { userId: session.user.id } } },
      }),
      prisma.ticket.count({
        where: { ...baseWhereClause, assigneeId: session.user.id, status: "waiting_feedback" },
      }),
      prisma.ticket.count({
        where: { ...baseWhereClause, assigneeId: session.user.id, priority: "urgent", status: { notIn: ["closed", "completed"] } },
      }),
    ]);

    return Response.json({
      stats: { assigned, created, involved, waiting, urgent },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
