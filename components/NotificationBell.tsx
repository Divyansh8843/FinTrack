'use client'

import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete } from "@/lib/apiClient";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open) {
      const fetchNotifications = () => {
        apiGet<Notification[]>("/api/notifications").then(setNotifications).finally(() => setLoading(false));
      };
      fetchNotifications();
      interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: string) {
    await apiPut<Notification>("/api/notifications", { id, read: true });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    // Automatically delete after seen
    await apiDelete("/api/notifications", { id });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }

  return (
    <div className="relative inline-block">
      <button
        className="relative p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 shadow-lg rounded-lg z-50 border">
          <div className="p-3 font-semibold border-b">Notifications</div>
          {loading ? (
            <div className="p-3 text-zinc-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-zinc-500">No notifications</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer ${n.read ? "bg-zinc-100 dark:bg-zinc-800" : "bg-blue-50 dark:bg-blue-900"}`}
                  onClick={() => {
                    if (!n.read) markAsRead(n._id);
                    if (n.link) window.location.href = n.link;
                  }}
                >
                  <div className="text-sm">{n.message}</div>
                  <div className="text-xs text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 