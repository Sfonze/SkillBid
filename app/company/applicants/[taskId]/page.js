"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { VerifiedBadge, StarRow, Badge } from "@/components/ui";
import { initials } from "@/lib/format";
import { money } from "@/lib/validators";

export default function Applicants({ params }) {
  const { taskId } = params;
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const [taskRes, appsRes] = await Promise.all([
      fetch(`/api/tasks/${taskId}`),
      fetch(`/api/applications?taskId=${taskId}`),
    ]);
    if (taskRes.ok) setTask((await taskRes.json()).task);
    if (appsRes.ok) setApplications((await appsRes.json()).applications);
    setLoaded(true);
  }

  useEffect(() => {
    if (authLoaded && user?.role !== "SME") { router.push("/login"); return; }
    if (user) load();
  }, [authLoaded, user]);

  async function accept(appId) {
    const res = await fetch(`/api/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept" }) });
    if (res.ok) router.push(`/contracts/${taskId}`);
  }
  async function reject(appId) {
    await fetch(`/api/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject" }) });
    setApplications((apps) => apps.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a)));
  }

  if (!loaded || !task) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "780px" }}>
        <button className="btn-text" onClick={() => router.push("/company/dashboard")}>← Back to dashboard</button>
        <div className="mt-16">
          <div className="eyebrow">{task.industry} · {money(task.remuneration)}</div>
          <h2>{applications.length} applicant{applications.length !== 1 ? "s" : ""} for &quot;{task.title}&quot;</h2>
        </div>

        {applications.length === 0 && <div className="empty-state mt-24"><h3>No applicants yet</h3><p>Students will appear here as they apply.</p></div>}

        <div className="list-stack mt-24">
          {applications.map((app) => (
            <div key={app.id} className="applicant-row">
              <div className="avatar">{initials(app.student.fullName)}</div>
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <strong>{app.student.fullName}</strong> <span className="text-faint text-sm">· {app.student.university}</span>
                  </div>
                  <div className="flex-gap">
                    <VerifiedBadge verified={app.student.verified} type="uni" />
                    {app.status !== "PENDING" && <Badge tone={app.status === "ACCEPTED" ? "sage" : "clay"}>{app.status === "ACCEPTED" ? "Accepted" : "Rejected"}</Badge>}
                  </div>
                </div>
                <div className="mt-8"><StarRow score={app.student.rating} /> <span className="text-faint text-sm">· {app.student.completedTasksCount} tasks completed</span></div>
                <div className="text-faint text-sm mt-8">Speaks {app.student.languages.join(", ")} · Skills: {app.student.skills.join(", ")}</div>
                <div style={{ background: "var(--paper-deep)", borderRadius: "9px", padding: "12px 14px", marginTop: "12px", fontSize: "14px" }}>&quot;{app.coverNote}&quot;</div>
                {app.status === "PENDING" && task.status === "OPEN" && (
                  <div className="flex-gap mt-16">
                    <button className="btn btn-sage btn-sm" onClick={() => accept(app.id)}>Accept & start contract</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => reject(app.id)}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
