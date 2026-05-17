import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const isAdmin = session.user.role === "admin";

  const whereClause = isAdmin
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
      where: { ...whereClause, assigneeId: session.user.id, status: { notIn: ["closed", "completed"] } },
    }),
    prisma.ticket.count({ where: { ...whereClause, creatorId: session.user.id } }),
    prisma.ticket.count({
      where: { members: { some: { userId: session.user.id } } },
    }),
    prisma.ticket.count({
      where: { ...whereClause, assigneeId: session.user.id, status: "waiting_feedback" },
    }),
    prisma.ticket.count({
      where: { ...whereClause, assigneeId: session.user.id, priority: "urgent", status: { notIn: ["closed", "completed"] } },
    }),
  ]);

  return Response.json({
    stats: { assigned, created, involved, waiting, urgent },
  });
}