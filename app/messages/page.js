"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { taskStatusBadge } from "@/components/ui";
import { initials, fmtDateTime } from "@/lib/format";

export default function Messages() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoaded && !user) { router.push("/login"); return; }
    if (!user) return;
    fetch("/api/conversations").then((r) => r.json()).then((d) => { setConversations(d.conversations || []); setLoaded(true); });
  }, [authLoaded, user]);

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "780px" }}>
        <div className="section-head" style={{ marginBottom: "28px" }}>
          <div className="eyebrow">Messages</div>
          <h2>{loaded ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}` : "Loading…"}</h2>
          <p className="section-sub">Every task with someone assigned gets its own thread here.</p>
        </div>

        {loaded && conversations.length === 0 && (
          <div className="empty-state">
            <h3>No conversations yet</h3>
            <p>{user.role === "STUDENT" ? "Once a company accepts one of your applications, you'll be able to message them here." : "Once you accept a student's application, you'll be able to message them here."}</p>
          </div>
        )}

        <div className="list-stack">
          {conversations.map((c) => (
            <div key={c.taskId} className="conversation-row" onClick={() => router.push(`/workspace/${c.taskId}`)}>
              <div className="avatar">{initials(c.counterpartName)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex-between" style={{ gap: "10px" }}>
                  <strong>{c.counterpartName}</strong>
                  {c.unreadCount > 0 && <span className="badge badge-stamp"><span className="badge-dot"></span>{c.unreadCount} new</span>}
                </div>
                <div className="text-faint text-sm">{c.taskTitle}</div>
                {c.lastMessage && (
                  <div className="conversation-preview text-sm">
                    {c.lastMessage.fromRole === user.role ? "You: " : ""}{c.lastMessage.text}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {taskStatusBadge({ status: c.taskStatus })}
                {c.lastMessage && <div className="text-faint text-sm mt-8">{fmtDateTime(c.lastMessage.timestamp)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
