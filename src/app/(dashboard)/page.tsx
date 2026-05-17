import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getStats(userId: string, isAdmin: boolean) {
  const whereClause = isAdmin
    ? {}
    : {
        OR: [
          { creatorId: userId },
          { assigneeId: userId },
          { members: { some: { userId } } },
        ],
      };

  const [assigned, created, waiting, urgent] = await Promise.all([
    prisma.ticket.count({
      where: { ...whereClause, assigneeId: userId, status: { notIn: ["closed", "completed"] } },
    }),
    prisma.ticket.count({ where: { ...whereClause, creatorId: userId } }),
    prisma.ticket.count({
      where: { ...whereClause, assigneeId: userId, status: "waiting_feedback" },
    }),
    prisma.ticket.count({
      where: { ...whereClause, assigneeId: userId, priority: "urgent", status: { notIn: ["closed", "completed"] } },
    }),
  ]);

  return { assigned, created, waiting, urgent };
}

async function getRecentTickets(userId: string, isAdmin: boolean) {
  const whereClause = isAdmin
    ? {}
    : {
        OR: [
          { creatorId: userId },
          { assigneeId: userId },
          { members: { some: { userId } } },
        ],
      };

  return prisma.ticket.findMany({
    where: whereClause,
    include: {
      creator: { select: { displayName: true } },
      assignee: { select: { displayName: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "admin";
  const [stats, tickets] = await Promise.all([
    getStats(session.user.id, isAdmin),
    getRecentTickets(session.user.id, isAdmin),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">工作台</h2>
          <p className="text-gray-500">欢迎回来，{session.user.name}</p>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建工单
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">待我处理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.assigned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">我发起的</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.created}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">等待反馈</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">紧急工单</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent tickets */}
      <Card>
        <CardHeader>
          <CardTitle>最近工单</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无工单</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{ticket.title}</h3>
                        <Badge status={ticket.status}>{STATUS_LABELS[ticket.status]}</Badge>
                        <Badge priority={ticket.priority}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                        <Badge variant="outline">{TYPE_LABELS[ticket.type]}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>发起人：{ticket.creator.displayName}</span>
                        {ticket.assignee && <span>负责人：{ticket.assignee.displayName}</span>}
                        <span>评论：{ticket._count.comments}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}