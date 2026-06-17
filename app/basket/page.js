"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { money } from "@/lib/validators";

const STATUS_TONE = { PENDING: "stamp", ACCEPTED: "sage", REJECTED: "clay" };
const STATUS_LABEL = { PENDING: "Pending review", ACCEPTED: "Accepted", REJECTED: "Not selected" };

export default function Basket() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/applications?mine=1");
    if (res.ok) setApplications((await res.json()).applications);
    setLoaded(true);
  }

  useEffect(() => {
    if (authLoaded && user?.role !== "STUDENT") { router.push("/login?role=student"); return; }
    if (user) load();
  }, [authLoaded, user]);

  async function withdraw(id) {
    await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "withdraw" }) });
    setApplications((apps) => apps.filter((a) => a.id !== id));
  }

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container">
        <div className="section-head" style={{ marginBottom: "28px" }}>
          <div className="eyebrow">My basket</div>
          <h2>{loaded ? `${applications.length} application${applications.length !== 1 ? "s" : ""}` : "Loading…"}</h2>
          <p className="section-sub">Every task you&apos;ve applied to, in one place.</p>
        </div>
        {loaded && applications.length === 0 && (
          <div className="empty-state"><h3>No applications yet</h3><p>Browse open tasks and apply to the ones that fit your skills.</p><button className="btn btn-stamp mt-16" onClick={() => router.push("/tasks")}>Browse tasks</button></div>
        )}
        <div className="list-stack">
          {applications.map((app) => (
            <div key={app.id} className="card card-pad">
              <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div className="eyebrow">{app.smeCompanyName}</div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>{app.task.title}</h3>
                  <div className="text-faint text-sm">Applied {fmtDate(app.appliedAt)} · {money(app.task.remuneration)}</div>
                </div>
                <Badge tone={STATUS_TONE[app.status]}>{STATUS_LABEL[app.status]}</Badge>
              </div>
              <div className="flex-gap mt-16">
                <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/tasks/${app.taskId}`)}>View task</button>
                {app.status === "PENDING" && <button className="btn btn-text btn-sm" onClick={() => withdraw(app.id)}>Withdraw application</button>}
                {app.status === "ACCEPTED" && <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/workspace/${app.taskId}`)}>Go to task →</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
