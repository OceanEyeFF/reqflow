import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const logs = await prisma.ticketLog.findMany({
    where: { ticketId: id },
    include: {
      user: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ logs });
}