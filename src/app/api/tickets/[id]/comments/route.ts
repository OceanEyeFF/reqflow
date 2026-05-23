import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewComment } from "@/lib/notifications";
import { canAccessTicket } from "@/lib/ticket-access";

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
    select: { id: true },
  });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权查看该工单评论" }, { status: 403 });
  }

  const comments = await prisma.ticketComment.findMany({
    where: { ticketId: id },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content : "";

  const existingTicket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existingTicket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  if (!(await canAccessTicket(id, session.user.id, session.user.role))) {
    return Response.json({ error: "无权评论该工单" }, { status: 403 });
  }

  if (!content?.trim()) {
    return Response.json({ error: "评论内容不能为空" }, { status: 400 });
  }

  if (content.length > 2000) {
    return Response.json({ error: "评论内容不能超过 2000 字" }, { status: 400 });
  }

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  // Update ticket's updatedAt
  await prisma.ticket.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  // Get ticket info for notifications
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: {
      title: true,
      creatorId: true,
      assigneeId: true,
      members: { select: { userId: true } },
    },
  });

  // Notify creator, assignee, and all members (excluding commenter)
  if (ticket) {
    await notifyNewComment(
      id,
      ticket.title,
      session.user.id,
      ticket.creatorId,
      ticket.assigneeId,
      ticket.members.map((m) => m.userId)
    );
  }

  return Response.json({ comment });
}
