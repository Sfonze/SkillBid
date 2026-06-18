"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatIcon } from "./Icon";

export default function MessagesBanner() {
  const router = useRouter();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    fetch("/api/conversations").then((r) => r.json()).then((d) => setConversations(d.conversations || []));
  }, []);

  if (conversations === null) return null;

  const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const latest = conversations[0];

  return (
    <button className="messages-banner" onClick={() => router.push("/messages")}>
      <div className="messages-banner-icon"><ChatIcon /></div>
      <div style={{ flex: 1, textAlign: "left" }}>
        {conversations.length === 0 ? (
          <>
            <div className="messages-banner-title">Messages</div>
            <div className="messages-banner-sub">No conversations yet, they'll appear here once you're matched on a task.</div>
          </>
        ) : unread > 0 ? (
          <>
            <div className="messages-banner-title">{unread} new message{unread > 1 ? "s" : ""}</div>
            <div className="messages-banner-sub">{latest ? `Latest from ${latest.counterpartName} on "${latest.taskTitle}"` : "Open your conversations"}</div>
          </>
        ) : (
          <>
            <div className="messages-banner-title">Messages</div>
            <div className="messages-banner-sub">{conversations.length} active conversation{conversations.length > 1 ? "s" : ""}, all caught up.</div>
          </>
        )}
      </div>
      <div className="messages-banner-arrow">→</div>
    </button>
  );
}
