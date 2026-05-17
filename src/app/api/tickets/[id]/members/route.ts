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

  const members = await prisma.ticketMember.findMany({
    where: { ticketId: id },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  return Response.json({ members });
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
  const { userId, role } = body;

  if (!userId) {
    return Response.json({ error: "用户ID不能为空" }, { status: 400 });
  }

  // Check if already a member
  const existing = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId: id, userId } },
  });

  if (existing) {
    return Response.json({ error: "该用户已是协作者" }, { status: 400 });
  }

  const member = await prisma.ticketMember.create({
    data: {
      ticketId: id,
      userId,
      role: role || "collaborator",
    },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  // Log the action
  await prisma.ticketLog.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      action: "member_added",
      newValue: `${member.user.displayName} (${role || "collaborator"})`,
    },
  });

  return Response.json({ member });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "用户ID不能为空" }, { status: 400 });
  }

  const member = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId: id, userId } },
    include: { user: true },
  });

  if (!member) {
    return Response.json({ error: "协作者不存在" }, { status: 404 });
  }

  await prisma.ticketMember.delete({
    where: { ticketId_userId: { ticketId: id, userId } },
  });

  // Log the action
  await prisma.ticketLog.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      action: "member_removed",
      oldValue: `${member.user.displayName}`,
    },
  });

  return Response.json({ success: true });
}