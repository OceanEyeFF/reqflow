"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS, MEMBER_ROLE_LABELS, TICKET_STATUS, TICKET_PRIORITY } from "@/types";
import { ArrowLeft, Download, Paperclip, Send, Trash2, Upload, User as UserIcon } from "lucide-react";

type TicketDetail = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  creator: { id: string; displayName: string };
  assignee: { id: string; displayName: string } | null;
  members: Array<{ id: string; role: string; user: { id: string; displayName: string } }>;
  comments: Array<{ id: string; content: string; createdAt: string; user: { displayName: string } }>;
  logs: Array<{ id: string; action: string; oldValue: string | null; newValue: string | null; createdAt: string; user: { displayName: string } }>;
};

type User = {
  id: string;
  displayName: string;
  username: string;
};

type CurrentUser = User & {
  role: string;
};

type TicketAttachment = {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState("");

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}`);
    if (res.ok) {
      const data = await res.json();
      setTicket(data.ticket);
    }
    setLoading(false);
  }, [ticketId]);

  const fetchAttachments = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}/attachments`);
    if (res.ok) {
      const data = await res.json();
      setAttachments(data.attachments || []);
    }
  }, [ticketId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [ticketRes, usersRes, meRes, attachmentsRes] = await Promise.all([
        fetch(`/api/tickets/${ticketId}`),
        fetch("/api/users"),
        fetch("/api/auth/me"),
        fetch(`/api/tickets/${ticketId}/attachments`),
      ]);

      if (cancelled) return;

      if (ticketRes.ok) {
        const data = await ticketRes.json();
        setTicket(data.ticket);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUser(data.user);
      }

      if (attachmentsRes.ok) {
        const data = await attachmentsRes.json();
        setAttachments(data.attachments || []);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  async function handleUploadAttachment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingAttachment(true);
    setAttachmentError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setSelectedFile(null);
      const input = document.getElementById("attachment-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await fetchAttachments();
    } else {
      const data = await res.json().catch(() => ({ error: "附件上传失败" }));
      setAttachmentError(data.error || "附件上传失败");
    }

    setUploadingAttachment(false);
  }

  async function handleDeleteAttachment(attachmentId: string) {
    setDeletingAttachmentId(attachmentId);
    setAttachmentError("");

    const res = await fetch(`/api/tickets/${ticketId}/attachments?attachmentId=${attachmentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await fetchAttachments();
    } else {
      const data = await res.json().catch(() => ({ error: "附件删除失败" }));
      setAttachmentError(data.error || "附件删除失败");
    }

    setDeletingAttachmentId(null);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });

    if (res.ok) {
      setComment("");
      fetchTicket();
    }
    setSubmittingComment(false);
  }

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchTicket();
  }

  async function handleAssigneeChange(newAssigneeId: string) {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: newAssigneeId || null }),
    });
    if (res.ok) fetchTicket();
  }

  async function handlePriorityChange(newPriority: string) {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: newPriority }),
    });
    if (res.ok) fetchTicket();
  }

  async function handleAddMember() {
    if (!newMemberId) return;

    const res = await fetch(`/api/tickets/${ticketId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newMemberId, role: "collaborator" }),
    });

    if (res.ok) {
      setNewMemberId("");
      setShowAddMember(false);
      fetchTicket();
    }
  }

  async function handleRemoveMember(userId: string) {
    const res = await fetch(`/api/tickets/${ticketId}/members?userId=${userId}`, {
      method: "DELETE",
    });
    if (res.ok) fetchTicket();
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-8">工单不存在</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and description */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge status={ticket.status} className="text-sm">{STATUS_LABELS[ticket.status]}</Badge>
                <Badge priority={ticket.priority}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                <Badge variant="outline">{TYPE_LABELS[ticket.type]}</Badge>
              </div>
              <h1 className="text-2xl font-bold mb-4">{ticket.title}</h1>
              {ticket.description && (
                <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>评论 ({ticket.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Comment list */}
              <div className="space-y-4 mb-6">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.user.displayName}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
                {ticket.comments.length === 0 && (
                  <p className="text-gray-400 text-center py-4">暂无评论</p>
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Textarea
                  placeholder="添加评论..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button type="submit" disabled={submittingComment || !comment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Activity log */}
          <Card>
            <CardHeader>
              <CardTitle>操作记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.logs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <span className="font-medium">{log.user.displayName}</span>
                    {" "}
                    {log.action === "created" && "创建了工单"}
                    {log.action === "status_changed" && `将状态从 ${STATUS_LABELS[log.oldValue || ""] || log.oldValue} 改为 ${STATUS_LABELS[log.newValue || ""] || log.newValue}`}
                    {log.action === "assignee_changed" && `更改了负责人`}
                    {log.action === "priority_changed" && `将优先级从 ${PRIORITY_LABELS[log.oldValue || ""] || log.oldValue} 改为 ${PRIORITY_LABELS[log.newValue || ""] || log.newValue}`}
                    {log.action === "member_added" && `添加了协作者 ${log.newValue}`}
                    {log.action === "member_removed" && `移除了协作者 ${log.oldValue}`}
                    <span className="text-gray-400 ml-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
                {ticket.logs.length === 0 && (
                  <p className="text-gray-400 text-center py-4">暂无操作记录</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Info sidebar */}
        <div className="space-y-6">
          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                附件 ({attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUploadAttachment} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="attachment-file" className="text-xs text-gray-500">
                    选择附件
                  </Label>
                  <input
                    id="attachment-file"
                    aria-label="选择附件"
                    type="file"
                    className="block w-full text-sm file:mr-3 file:h-8 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:text-sm"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-400">支持图片、PDF、Office、ZIP、TXT，单个文件不超过 10MB。</p>
                </div>
                <Button type="submit" size="sm" disabled={!selectedFile || uploadingAttachment}>
                  <Upload className="w-4 h-4" />
                  {uploadingAttachment ? "上传中..." : "上传附件"}
                </Button>
              </form>

              {attachmentError && (
                <p className="text-sm text-red-600" role="alert">{attachmentError}</p>
              )}

              <div className="space-y-3">
                {attachments.map((attachment) => {
                  const canDelete =
                    currentUser?.role === "admin" || currentUser?.id === attachment.user.id;

                  return (
                    <div key={attachment.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={`/api/tickets/${ticketId}/attachments/${attachment.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-medium hover:underline"
                            aria-label={`下载 ${attachment.filename}`}
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            <span className="truncate">{attachment.filename}</span>
                          </a>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatFileSize(attachment.fileSize)} · {attachment.user.displayName}
                          </p>
                        </div>
                        {canDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`删除 ${attachment.filename}`}
                            disabled={deletingAttachmentId === attachment.id}
                            onClick={() => handleDeleteAttachment(attachment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {attachments.length === 0 && (
                  <p className="text-gray-400 text-sm">暂无附件</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status actions */}
          <Card>
            <CardHeader>
              <CardTitle>状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Object.entries(TICKET_STATUS).map(([key, value]) => (
                  <Button
                    key={key}
                    variant={ticket.status === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(value)}
                  >
                    {STATUS_LABELS[value]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">负责人</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={ticket.assignee?.id || ""}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                >
                  <option value="">未指派</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">优先级</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
                    <option key={key} value={value}>{PRIORITY_LABELS[value]}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">发起人</Label>
                <p className="mt-1 text-sm">{ticket.creator.displayName}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">创建时间</Label>
                <p className="mt-1 text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>

              {ticket.dueDate && (
                <div>
                  <Label className="text-xs text-gray-500">截止日期</Label>
                  <p className="mt-1 text-sm">{new Date(ticket.dueDate).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>协作者</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddMember(!showAddMember)}>
                {showAddMember ? "取消" : "添加"}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddMember && (
                <div className="flex gap-2 mb-4">
                  <select
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                  >
                    <option value="">选择用户</option>
                    {users
                      .filter((u) => !ticket.members.some((m) => m.user.id === u.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName}
                        </option>
                      ))}
                  </select>
                  <Button size="sm" onClick={handleAddMember} disabled={!newMemberId}>
                    添加
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {ticket.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{member.user.displayName}</p>
                      <Badge memberRole={member.role}>{MEMBER_ROLE_LABELS[member.role]}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user.id)}
                    >
                      移除
                    </Button>
                  </div>
                ))}
                {ticket.members.length === 0 && (
                  <p className="text-gray-400 text-sm">暂无协作者</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
