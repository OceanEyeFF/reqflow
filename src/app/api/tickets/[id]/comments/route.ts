import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewComment } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

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
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return Response.json({ error: "评论内容不能为空" }, { status: 400 });
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