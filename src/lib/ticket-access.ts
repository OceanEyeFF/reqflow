import { prisma } from "@/lib/prisma";

export async function canAccessTicket(ticketId: string, userId: string, role: string) {
  if (role === "admin") return true;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  });

  return Boolean(ticket);
}

export async function canModifyTicket(ticketId: string, userId: string, role: string) {
  if (role === "admin") return true;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      creatorId: true,
      assigneeId: true,
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!ticket) return false;
  if (ticket.creatorId === userId || ticket.assigneeId === userId) return true;

  return ticket.members.some((member) => member.role === "owner");
}
