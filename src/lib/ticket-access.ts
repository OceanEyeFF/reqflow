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
