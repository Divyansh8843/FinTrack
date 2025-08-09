"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; right: number }>({
    top: 64,
    right: 16,
  });

  // Update panel position relative to bell button
  useEffect(() => {
    const updatePos = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelPos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current && btnRef.current.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Fetch notifications when panel opens; keep polling while open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open) {
      const fetchNotifications = () => {
        apiGet<Notification[]>("/api/notifications")
          .then((list) => setNotifications(list))
          .finally(() => setLoading(false));
      };
      fetchNotifications();
      interval = setInterval(fetchNotifications, 5000);
    }
    return () => clearInterval(interval);
  }, [open]);

  // Background refresh for unread badge (every 30s), even when closed
  useEffect(() => {
    const fetchNotifications = () => {
      apiGet<Notification[]>("/api/notifications").then((list) =>
        setNotifications(list)
      );
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: string) {
    await apiPut<Notification>("/api/notifications", { id, read: true });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    // Automatically delete after seen
    await apiDelete("/api/notifications", { id });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }

  return (
    <div className="relative inline-block z-[10000]">
      <button
        ref={btnRef}
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
      {open &&
        createPortal(
          <div
            className="w-80 bg-white dark:bg-zinc-900 shadow-2xl rounded-lg border pointer-events-auto overflow-hidden"
            style={{
              position: "fixed",
              top: panelPos.top,
              right: panelPos.right,
              zIndex: 2147483647,
              overscrollBehavior: "contain",
            }}
            role="dialog"
            aria-modal="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="p-3 font-semibold border-b">Notifications</div>
            {loading ? (
              <div className="p-3 text-zinc-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-3 text-zinc-500">No notifications</div>
            ) : (
              <ul
                className="max-h-40 md:max-h-48 overflow-y-scroll overscroll-y-contain custom-scrollbar scrollbar-stable pr-1"
                style={{ WebkitOverflowScrolling: "touch" }}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {notifications.slice(0, 6).map((n) => (
                  <li
                    key={n._id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer ${
                      n.read
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "bg-blue-50 dark:bg-blue-900"
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead(n._id);
                      if (n.link) window.location.href = n.link;
                    }}
                  >
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
