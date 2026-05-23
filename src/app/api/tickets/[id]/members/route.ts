import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyMemberAdded } from "@/lib/notifications";
import { canAccessTicket } from "@/lib/ticket-access";

const VALID_MEMBER_ROLES = ["owner", "collaborator", "watcher"];

// Helper: check if user can modify members (admin, creator, assignee, or owner role)
async function canModifyMembers(ticketId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === "admin") return true;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { creatorId: true, assigneeId: true },
  });

  if (!ticket) return false;

  if (ticket.creatorId === userId || ticket.assigneeId === userId) {
    return true;
  }

  const member = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId, userId } },
    select: { role: true },
  });

  return member?.role === "owner";
}

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
    return Response.json({ error: "无权查看该工单协作者" }, { status: 403 });
  }

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
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const role = typeof body?.role === "string" ? body.role : "";

  if (!userId) {
    return Response.json({ error: "用户ID不能为空" }, { status: 400 });
  }

  if (role && !VALID_MEMBER_ROLES.includes(role)) {
    return Response.json({ error: `角色必须是以下之一: ${VALID_MEMBER_ROLES.join(", ")}` }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { title: true, creatorId: true, assigneeId: true },
  });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  // Permission check: only admin, creator, assignee, or owner role can add members
  const canModify = await canModifyMembers(id, session.user.id, session.user.role);
  if (!canModify) {
    return Response.json({ error: "只有工单创建者、负责人或owner角色成员可以添加协作者" }, { status: 403 });
  }

  if (ticket.creatorId === userId || ticket.assigneeId === userId) {
    return Response.json({ error: "发起人和负责人不需要重复添加为协作者" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!targetUser) {
    return Response.json({ error: "用户不存在" }, { status: 404 });
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

  await notifyMemberAdded(id, userId, ticket.title);

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

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  // Permission check: only admin, creator, assignee, or owner role can remove members
  const canModify = await canModifyMembers(id, session.user.id, session.user.role);
  if (!canModify) {
    return Response.json({ error: "只有工单创建者、负责人或owner角色成员可以移除协作者" }, { status: 403 });
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

// PATCH /api/tickets/[id]/members?userId=xxx
// Update member role (owner / collaborator / watcher)
export async function PATCH(
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

  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" ? body.role : "";

  if (!role || !VALID_MEMBER_ROLES.includes(role)) {
    return Response.json({ error: `角色必须是以下之一: ${VALID_MEMBER_ROLES.join(", ")}` }, { status: 400 });
  }

  // Permission check: only admin, creator, assignee, or owner role can modify member roles
  const canModify = await canModifyMembers(id, session.user.id, session.user.role);
  if (!canModify) {
    return Response.json({ error: "只有工单创建者、负责人或owner角色成员可以修改协作者角色" }, { status: 403 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { creatorId: true },
  });

  if (!ticket) {
    return Response.json({ error: "工单不存在" }, { status: 404 });
  }

  // Cannot change the creator's role
  if (ticket.creatorId === userId) {
    return Response.json({ error: "不能修改工单创建者的角色" }, { status: 403 });
  }

  // Get current member
  const member = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId: id, userId } },
    include: { user: true },
  });

  if (!member) {
    return Response.json({ error: "协作者不存在" }, { status: 404 });
  }

  const oldRole = member.role;

  // Update role
  const updated = await prisma.ticketMember.update({
    where: { ticketId_userId: { ticketId: id, userId } },
    data: { role },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  // Log the action
  await prisma.ticketLog.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      action: "member_role_changed",
      oldValue: `${member.user.displayName}: ${oldRole}`,
      newValue: `${member.user.displayName}: ${role}`,
    },
  });

  return Response.json({ member: updated });
}
