import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyTicketAssigned, notifyStatusChanged } from "@/lib/notifications";
import { canAccessTicket, canModifyTicket } from "@/lib/ticket-access";

type TicketPatchBody = {
  status?: string;
  assigneeId?: string | null;
  priority?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

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

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权查看该工单" }, { status: 403 });
  }

  return Response.json({ ticket });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as TicketPatchBody;

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  if (!(await canModifyTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权修改该工单" }, { status: 403 });
  }

  const updateData: Prisma.TicketUncheckedUpdateInput = {};
  const logs: Prisma.TicketLogCreateManyInput[] = [];

  // Handle status change
  if (body.status && body.status !== ticket.status) {
    updateData.status = body.status;
    if (body.status === "closed") {
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
  if (body.priority && body.priority !== ticket.priority) {
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
  if (body.status && body.status !== ticket.status) {
    await notifyStatusChanged(id, ticket.title, body.status, ticket.creatorId, ticket.assigneeId, session.user.id);
  }

  return Response.json({ ticket: updatedTicket });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json({ error: "需要管理员权限" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.ticket.delete({ where: { id } });

  return Response.json({ success: true });
}
