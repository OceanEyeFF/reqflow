"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS, MEMBER_ROLE_LABELS } from "@/types";
import { Plus, Search, Users } from "lucide-react";

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("assigned_to_me");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [keyword, setKeyword] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID from session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [scope, status, priority, currentUserId]);

  async function fetchTickets() {
    setLoading(true);
    const params = new URLSearchParams({ scope });
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (keyword) params.set("keyword", keyword);

    const res = await fetch(`/api/tickets?${params}`);
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTickets();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">工单列表</h2>
        <Link href="/tickets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建工单
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            {/* Scope tabs */}
            <div className="flex gap-2">
              {[
                { value: "assigned_to_me", label: "待我处理" },
                { value: "created_by_me", label: "我发起的" },
                { value: "joined", label: "我参与的" },
                { value: "all", label: "全部工单" },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant={scope === tab.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScope(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="flex-1 flex gap-2 items-center">
              <Input
                placeholder="搜索标题..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-xs"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Status filter */}
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">所有状态</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">所有优先级</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </form>
        </CardContent>
      </Card>

      {/* Tickets list */}
      <Card>
        <CardHeader>
          <CardTitle>工单列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">加载中...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center py-8 text-gray-500">暂无工单</p>
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
                          <h3 className="font-medium">{ticket.title}</h3>
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