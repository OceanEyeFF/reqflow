"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS, MEMBER_ROLE_LABELS } from "@/types";
import { Plus, Users } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; displayName: string };
  assignee: { displayName: string } | null;
  members: Array<{ role: string; user: { id: string } }>;
  _count: { comments: number };
};

type Stats = {
  assigned: number;
  created: number;
  waiting: number;
  urgent: number;
  involved: number;
};

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ assigned: 0, created: 0, waiting: 0, urgent: 0, involved: 0 });
  const [activeTab, setActiveTab] = useState<"assigned" | "created" | "involved">("assigned");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading state before async fetch
    setLoading(true);

    // Map tab to scope
    const scopeMap = {
      assigned: "assigned_to_me",
      created: "created_by_me",
      involved: "joined",
    };

    Promise.all([
      fetch(`/api/tickets?scope=${scopeMap[activeTab]}&status=`),
      fetch("/api/tickets/stats"),
    ])
      .then(([ticketsRes, statsRes]) => Promise.all([ticketsRes.json(), statsRes.json()]))
      .then(([ticketsData, statsData]) => {
        setTickets(ticketsData.tickets || []);
        if (statsData.stats) {
          setStats(statsData.stats);
        }
        setLoading(false);
      });
  }, [activeTab]);

  const tabLabels = {
    assigned: "待我处理",
    created: "我发起的",
    involved: "我参与的",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">工作台</h2>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建工单
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveTab("assigned")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">待我处理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.assigned}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveTab("created")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">我发起的</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.created}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveTab("involved")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">我参与的</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.involved}</p>
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

      {/* Tab buttons */}
      <div className="flex gap-2">
        {(["assigned", "created", "involved"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </Button>
        ))}
      </div>

      {/* Ticket list */}
      <Card>
        <CardHeader>
          <CardTitle>{tabLabels[activeTab]} ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">加载中...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无工单</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const myRole = ticket.members.find((m) => m.user.id === currentUserId)?.role;
                return (
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
                          {myRole && <Badge memberRole={myRole}>{MEMBER_ROLE_LABELS[myRole]}</Badge>}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>发起人：{ticket.creator.displayName}</span>
                          {ticket.assignee && <span>负责人：{ticket.assignee.displayName}</span>}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {ticket.members.length}
                          </span>
                          <span>评论：{ticket._count.comments}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}