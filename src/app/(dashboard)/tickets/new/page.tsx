"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TICKET_TYPE, TICKET_PRIORITY } from "@/types";

type User = {
  id: string;
  displayName: string;
  username: string;
};

type StagedAiDraft = {
  title: string;
  description: string;
  type: string;
  priority: string;
  stagedAt: string;
};

const emptyForm = {
  title: "",
  description: "",
  type: "需求",
  priority: "medium",
  assigneeId: "",
  dueDate: "",
};

export default function NewTicketPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => {
    const draft = readStagedAiDraft();
    if (!draft) return emptyForm;

    return {
      ...emptyForm,
      title: draft.title,
      description: draft.description,
      type: draft.type,
      priority: draft.priority,
    };
  });
  const [aiDraftLoaded, setAiDraftLoaded] = useState(() => Boolean(readStagedAiDraft()));

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  function clearAiDraft() {
    sessionStorage.removeItem("reqflow.aiDraft");
    setAiDraftLoaded(false);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/tickets/${data.ticket.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">新建工单</h2>
        <p className="text-gray-500">创建一个新的工单需求</p>
      </div>

      {aiDraftLoaded && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col gap-3 pt-6 text-sm text-green-800 sm:flex-row sm:items-center sm:justify-between">
            <p>已载入 AI 草稿。请检查并编辑字段，确认无误后再手动创建工单。</p>
            <Button type="button" variant="outline" size="sm" onClick={clearAiDraft}>
              清除草稿
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                placeholder="请输入工单标题"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <select
                  id="type"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {Object.entries(TICKET_TYPE).map(([key, label]) => (
                    <option key={key} value={label}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <select
                  id="priority"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {Object.entries(TICKET_PRIORITY).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigneeId">负责人</Label>
              <select
                id="assigneeId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              >
                <option value="">请选择负责人</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName} (@{user.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">截止日期</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">需求描述</Label>
              <Textarea
                id="description"
                placeholder="请详细描述需求内容..."
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "创建中..." : "创建工单"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function readStagedAiDraft(): StagedAiDraft | null {
  if (typeof window === "undefined") return null;

  const storedDraft = sessionStorage.getItem("reqflow.aiDraft");
  if (!storedDraft) return null;

  try {
    const draft = JSON.parse(storedDraft) as Partial<StagedAiDraft>;
    if (
      typeof draft.title !== "string" ||
      typeof draft.description !== "string" ||
      typeof draft.type !== "string" ||
      typeof draft.priority !== "string" ||
      typeof draft.stagedAt !== "string"
    ) {
      sessionStorage.removeItem("reqflow.aiDraft");
      return null;
    }

    return {
      title: draft.title,
      description: draft.description,
      type: draft.type,
      priority: draft.priority,
      stagedAt: draft.stagedAt,
    };
  } catch {
    sessionStorage.removeItem("reqflow.aiDraft");
    return null;
  }
}
