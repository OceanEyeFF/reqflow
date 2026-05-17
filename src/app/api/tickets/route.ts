import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyTicketAssigned } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "assigned_to_me";
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const keyword = searchParams.get("keyword");

  const isAdmin = session.user.role === "admin";

  // Build where clause based on scope
  let whereClause: any = {};

  if (!isAdmin && scope !== "all") {
    switch (scope) {
      case "assigned_to_me":
        whereClause.assigneeId = session.user.id;
        break;
      case "created_by_me":
        whereClause.creatorId = session.user.id;
        break;
      case "joined":
        whereClause.members = { some: { userId: session.user.id } };
        break;
    }
  }

  // Add filters
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (keyword) {
    whereClause.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      creator: { select: { id: true, displayName: true, avatarUrl: true } },
      assignee: { select: { id: true, displayName: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ tickets });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, type, priority, assigneeId, dueDate } = body;

  if (!title) {
    return Response.json({ error: "标题不能为空" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      type: type || "需求",
      priority: priority || "medium",
      status: "pending",
      creatorId: session.user.id,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  // Create log entry
  await prisma.ticketLog.create({
    data: {
      ticketId: ticket.id,
      userId: session.user.id,
      action: "created",
      newValue: "待处理",
    },
  });

  // Notify assignee if assigned
  if (assigneeId) {
    await notifyTicketAssigned(ticket.id, assigneeId, title);
  }

  return Response.json({ ticket });
}