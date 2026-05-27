import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";
import { notifyTicketAssigned, notifyStatusChanged } from "@/lib/notifications";
import { requireTicketAccess, ticketAccessErrorResponse } from "@/lib/ticket-access";
import { TICKET_STATUS, TICKET_PRIORITY } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id } = await params;
    await requireTicketAccess(id, session);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        assignee: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
        },
        comments: {
          include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        logs: {
          include: { user: { select: { displayName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ticket) {
      return Response.json({ error: "工单不存在" }, { status: 404 });
    }

    return Response.json({ ticket });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    const accessResponse = ticketAccessErrorResponse(error);
    if (accessResponse) return accessResponse;
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id } = await params;
    const body = await request.json();
    await requireTicketAccess(id, session);

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return Response.json({ error: "工单不存在" }, { status: 404 });
    }

    const updateData: Record<string, string | Date | null> = {};
    const logs: Array<{ ticketId: string; userId: string; action: string; oldValue: string | null; newValue: string | null }> = [];

    // Handle status change
    const validStatuses = Object.values(TICKET_STATUS);
    if (body.status !== undefined && body.status !== ticket.status) {
      if (!validStatuses.includes(body.status)) {
        return Response.json({ error: "无效的状态值" }, { status: 400 });
      }
      updateData.status = body.status;
      if (body.status === TICKET_STATUS.CLOSED) {
        updateData.closedAt = new Date();
      }
      logs.push({
        ticketId: id,
        userId: session.user.id,
        action: "status_changed",
        oldValue: ticket.status,
        newValue: body.status,
      });
    }

    // Handle assignee change
    if (body.assigneeId !== undefined && body.assigneeId !== ticket.assigneeId) {
      updateData.assigneeId = body.assigneeId;
      logs.push({
        ticketId: id,
        userId: session.user.id,
        action: "assignee_changed",
        oldValue: ticket.assigneeId,
        newValue: body.assigneeId,
      });
    }

    // Handle priority change
    const validPriorities = Object.values(TICKET_PRIORITY);
    if (body.priority !== undefined && body.priority !== ticket.priority) {
      if (!validPriorities.includes(body.priority)) {
        return Response.json({ error: "无效的优先级" }, { status: 400 });
      }
      updateData.priority = body.priority;
      logs.push({
        ticketId: id,
        userId: session.user.id,
        action: "priority_changed",
        oldValue: ticket.priority,
        newValue: body.priority,
      });
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    // Create log entries
    if (logs.length > 0) {
      await prisma.ticketLog.createMany({ data: logs });
    }

    // Send notifications
    // Notify new assignee when assigned
    if (body.assigneeId !== undefined && body.assigneeId !== ticket.assigneeId && body.assigneeId) {
      await notifyTicketAssigned(id, body.assigneeId, ticket.title);
    }

    // Notify on status change
    if (body.status !== undefined && body.status !== ticket.status) {
      await notifyStatusChanged(id, ticket.title, body.status, ticket.creatorId, ticket.assigneeId, session.user.id);
    }

    return Response.json({ ticket: updatedTicket });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    const accessResponse = ticketAccessErrorResponse(error);
    if (accessResponse) return accessResponse;
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
      return Response.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return Response.json({ error: "工单不存在" }, { status: 404 });
    }

    await prisma.ticket.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error(error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
