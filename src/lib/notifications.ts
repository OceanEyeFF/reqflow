import { prisma } from "@/lib/prisma";

/**
 * Create a notification for a user
 */
async function createNotification({
  userId,
  type,
  title,
  content,
  ticketId,
}: {
  userId: string;
  type: string;
  title: string;
  content?: string | null;
  ticketId?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      content: content || null,
      ticketId: ticketId || null,
    },
  });
}

/**
 * Notify ticket assignee when assigned
 */
export async function notifyTicketAssigned(ticketId: string, assigneeId: string, ticketTitle: string) {
  await createNotification({
    userId: assigneeId,
    type: "ticket_assigned",
    title: "您被分配了工单",
    content: ticketTitle,
    ticketId,
  });
}

/**
 * Notify user when added as a member
 */
export async function notifyMemberAdded(ticketId: string, userId: string, ticketTitle: string) {
  await createNotification({
    userId,
    type: "member_added",
    title: "您被添加为协作者",
    content: ticketTitle,
    ticketId,
  });
}

/**
 * Notify creator + assignee + members when ticket is commented (excluding commenter)
 */
export async function notifyNewComment(
  ticketId: string,
  ticketTitle: string,
  commenterId: string,
  creatorId: string,
  assigneeId: string | null,
  memberUserIds: string[]
) {
  const recipientIds = new Set<string>();

  // Notify creator if not the commenter
  if (creatorId !== commenterId) {
    recipientIds.add(creatorId);
  }

  // Notify assignee if exists and not the commenter
  if (assigneeId && assigneeId !== commenterId) {
    recipientIds.add(assigneeId);
  }

  // Notify all members except the commenter
  for (const memberUserId of memberUserIds) {
    if (memberUserId !== commenterId) {
      recipientIds.add(memberUserId);
    }
  }

  // Create notifications for all recipients
  await Promise.all(
    Array.from(recipientIds).map((userId) =>
      createNotification({
        userId,
        type: "new_comment",
        title: "工单收到新评论",
        content: ticketTitle,
        ticketId,
      })
    )
  );
}

/**
 * Notify creator + assignee when status changes
 */
export async function notifyStatusChanged(
  ticketId: string,
  ticketTitle: string,
  newStatus: string,
  creatorId: string,
  assigneeId: string | null,
  changerId: string
) {
  const recipientIds = new Set<string>();

  // Notify creator if not the changer
  if (creatorId !== changerId) {
    recipientIds.add(creatorId);
  }

  // Notify assignee if exists and not the changer
  if (assigneeId && assigneeId !== changerId) {
    recipientIds.add(assigneeId);
  }

  await Promise.all(
    Array.from(recipientIds).map((userId) =>
      createNotification({
        userId,
        type: "status_changed",
        title: `工单状态已更新为"${newStatus}"`,
        content: ticketTitle,
        ticketId,
      })
    )
  );
}