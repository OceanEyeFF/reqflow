import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";
import { notifyTicketAssigned } from "@/lib/notifications";
import { ticketParticipantWhere } from "@/lib/ticket-access";
import { TICKET_TYPE, TICKET_PRIORITY } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "assigned_to_me";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const keyword = searchParams.get("keyword");

    const isAdmin = session.user.role === "admin";

    // Build where clause based on scope
    const whereClause: Record<string, unknown> = {};

    if (!isAdmin) {
      switch (scope) {
        case "all":
          Object.assign(whereClause, ticketParticipantWhere(session.user.id));
          break;
        case "assigned_to_me":
          whereClause.assigneeId = session.user.id;
          break;
        case "created_by_me":
          whereClause.creatorId = session.user.id;
          break;
        case "joined":
          whereClause.members = { some: { userId: session.user.id } };
          break;
        default:
          // Invalid scope - fall back to assigned_to_me for safety
          whereClause.assigneeId = session.user.id;
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
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { title, description, type, priority, assigneeId, dueDate } = body;

    // Validate title
    if (!title || (typeof title === "string" && title.trim().length === 0)) {
      return Response.json({ error: "标题不能为空" }, { status: 400 });
    }

    // Validate type
    const validTypes = Object.values(TICKET_TYPE);
    if (type && !validTypes.includes(type)) {
      return Response.json({ error: "无效的工单类型" }, { status: 400 });
    }

    // Validate priority
    const validPriorities = Object.values(TICKET_PRIORITY);
    if (priority && !validPriorities.includes(priority)) {
      return Response.json({ error: "无效的优先级" }, { status: 400 });
    }

    // Validate assigneeId
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) {
        return Response.json({ error: "指派的用户不存在" }, { status: 400 });
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        type: type || TICKET_TYPE.DEMAND,
        priority: priority || TICKET_PRIORITY.MEDIUM,
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
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
