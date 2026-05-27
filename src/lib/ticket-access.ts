import type { Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export class TicketAccessError extends Error {
  constructor(
    message: string,
    public readonly status: 403 | 404
  ) {
    super(message);
  }
}

export function isAdminSession(session: Session): boolean {
  return session.user.role === "admin";
}

export function ticketParticipantWhere(userId: string): Prisma.TicketWhereInput {
  return {
    OR: [
      { creatorId: userId },
      { assigneeId: userId },
      { members: { some: { userId } } },
    ],
  };
}

export function accessibleTicketWhere(session: Session): Prisma.TicketWhereInput {
  if (isAdminSession(session)) {
    return {};
  }
  return ticketParticipantWhere(session.user.id);
}

export async function requireTicketAccess(
  ticketId: string,
  session: Session
): Promise<void> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { creatorId: true, assigneeId: true },
  });

  if (!ticket) {
    throw new TicketAccessError("工单不存在", 404);
  }

  if (isAdminSession(session)) {
    return;
  }

  if (ticket.creatorId === session.user.id || ticket.assigneeId === session.user.id) {
    return;
  }

  const member = await prisma.ticketMember.findUnique({
    where: { ticketId_userId: { ticketId, userId: session.user.id } },
    select: { id: true },
  });

  if (!member) {
    throw new TicketAccessError("无权访问该工单", 403);
  }
}

export function ticketAccessErrorResponse(error: unknown): Response | null {
  if (!(error instanceof TicketAccessError)) {
    return null;
  }

  return Response.json({ error: error.message }, { status: error.status });
}
