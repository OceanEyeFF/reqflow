import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { notifyMemberAdded } from "@/lib/notifications";

// Helper: check if user can modify members (creator, assignee, or owner role)
async function canModifyMembers(ticketId: string, userId: string): Promise<boolean> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { creatorId: true, assigneeId: true },
  });

  if (!ticket) return false;

  // Creator or current assignee can modify members
  if (ticket.creatorId === userId || ticket.assigneeId === userId) {
    return true;
  }

  // Or user has 'owner' role in ticket members
  const member = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId, userId } },
  });

  return member?.role === "owner";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;

    const members = await prisma.ticketMember.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    return Response.json({ members });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Members GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id } = await params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return Response.json({ error: "用户ID不能为空" }, { status: 400 });
    }

    // Permission check: only creator, assignee, or owner role can add members
    const canModify = await canModifyMembers(id, session.user.id);
    if (!canModify) {
      return Response.json({ error: "只有工单创建者、负责人或owner角色成员可以添加协作者" }, { status: 403 });
    }

    // Check if already a member
    const existing = await prisma.ticketMember.findUnique({
      where: { ticketId_userId: { ticketId: id, userId } },
    });

    if (existing) {
      return Response.json({ error: "该用户已是协作者" }, { status: 400 });
    }

    // Get ticket title for notification
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { title: true },
    });

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

    // Notify the added member
    if (ticket) {
      await notifyMemberAdded(id, userId, ticket.title);
    }

    return Response.json({ member });
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Members POST error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "用户ID不能为空" }, { status: 400 });
    }

    // Permission check: only creator, assignee, or owner role can remove members
    const canModify = await canModifyMembers(id, session.user.id);
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
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Members DELETE error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

// PATCH /api/tickets/[id]/members?userId=xxx
// Update member role (owner / collaborator / watcher)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "用户ID不能为空" }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ["owner", "collaborator", "watcher"];
    if (!role || !validRoles.includes(role)) {
      return Response.json({ error: `角色必须是以下之一: ${validRoles.join(", ")}` }, { status: 400 });
    }

    // Permission check: only creator, assignee, or owner role can modify member roles
    const canModify = await canModifyMembers(id, session.user.id);
    if (!canModify) {
      return Response.json({ error: "只有工单创建者、负责人或owner角色成员可以修改协作者角色" }, { status: 403 });
    }

    // Get ticket to check if target user is the creator
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
  } catch (error) {
    if (error instanceof Error && error.message === "未登录") {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Members PATCH error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
