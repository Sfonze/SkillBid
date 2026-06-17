"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const LINK_PATHS = {
  "sme-applicants": (taskId) => `/company/applicants/${taskId}`,
  "contract-flow": (taskId) => `/contracts/${taskId}`,
  "task-workspace": (taskId) => `/workspace/${taskId}`,
  "browse-tasks": () => `/tasks`,
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
    }
    setLoaded(true);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    }
  }

  function handleClick(n) {
    setOpen(false);
    if (n.link && LINK_PATHS[n.link.view]) {
      router.push(LINK_PATHS[n.link.view](n.link.taskId));
    }
  }

  if (!loaded) return null;

  return (
    <div className="relative">
      <button className="bell-btn" onClick={handleOpen} aria-label="Notifications">
        🔔{unread > 0 && <span className="bell-dot"></span>}
      </button>
      {open && (
        <div className="notif-panel">
          {notifications.length === 0 && <div className="notif-item text-faint">No notifications yet.</div>}
          {notifications.map((n) => (
            <div key={n.id} className={"notif-item" + (!n.read ? " unread" : "")} style={{ cursor: n.link ? "pointer" : "default" }} onClick={() => handleClick(n)}>
              <div>{n.text}</div>
              <div className="notif-time">{fmtDateTime(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
