"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  content: string | null;
  ticketId: string | null;
  isRead: boolean;
  createdAt: string;
  ticket: {
    id: string;
    title: string;
    status: string;
    priority: string;
  } | null;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    const res = await fetch("/api/notifications");
    if (!res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function markRead(notificationId: string) {
    const target = notifications.find((notification) => notification.id === notificationId);
    const wasUnread = target ? !target.isRead : false;

    const res = await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
    if (!res.ok) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
    if (!res.ok) return;

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }

  const buttonLabel = unreadCount > 0 ? `通知，${unreadCount} 条未读` : "通知，无未读";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={buttonLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-xs leading-5 text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="通知列表"
          className="absolute right-0 top-11 z-50 w-80 rounded-md border bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">通知</h2>
              <p className="text-xs text-gray-500">{unreadCount} 条未读</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0}
              onClick={markAllRead}
            >
              全部已读
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading && <p className="px-2 py-6 text-center text-sm text-gray-400">加载中...</p>}
            {!loading && notifications.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-gray-400">暂无通知</p>
            )}
            {!loading &&
              notifications.map((notification) => {
                const label = notification.ticket?.title || notification.content || notification.title;

                return (
                  <div
                    key={notification.id}
                    className="rounded-md px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2 w-2 rounded-full ${
                          notification.isRead ? "bg-gray-300" : "bg-red-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {notification.ticketId ? (
                          <Link
                            href={`/tickets/${notification.ticketId}`}
                            className="mt-1 block truncate text-sm text-gray-600 hover:underline"
                            aria-label={label}
                            onClick={() => setOpen(false)}
                          >
                            {label}
                          </Link>
                        ) : (
                          <p className="mt-1 text-sm text-gray-600">{label}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`标记已读 ${label}`}
                          onClick={() => markRead(notification.id)}
                        >
                          已读
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
