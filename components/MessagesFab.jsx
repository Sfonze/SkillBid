"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./Providers";
import { ChatIcon } from "./Icon";

export default function MessagesFab() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    function load() {
      fetch("/api/conversations").then((r) => r.json()).then((d) => {
        if (cancelled) return;
        const total = (d.conversations || []).reduce((sum, c) => sum + c.unreadCount, 0);
        setUnread(total);
      });
    }
    load();
    const interval = setInterval(load, 20000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  if (!user || pathname === "/messages") return null;

  return (
    <button className="messages-fab" onClick={() => router.push("/messages")} aria-label="Messages">
      <ChatIcon size={24} />
      {unread > 0 && <span className="messages-fab-badge">{unread > 9 ? "9+" : unread}</span>}
    </button>
  );
}
