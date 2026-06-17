"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { Pipeline, VerifiedBadge, taskStatusBadge } from "@/components/ui";
import { money } from "@/lib/validators";

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [applicationsByTask, setApplicationsByTask] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoaded && user?.role !== "SME") { router.push("/login"); return; }
    if (!user) return;
    fetch("/api/tasks?mine=1").then((r) => r.json()).then(async (data) => {
      const myTasks = data.tasks || [];
      setTasks(myTasks);
      const openTasks = myTasks.filter((t) => t.status === "OPEN");
      const entries = await Promise.all(openTasks.map(async (t) => {
        const r = await fetch(`/api/applications?taskId=${t.id}`);
        const d = await r.json();
        return [t.id, d.applications || []];
      }));
      setApplicationsByTask(Object.fromEntries(entries));
      setLoaded(true);
    });
  }, [authLoaded, user]);

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;

  const open = tasks.filter((t) => t.status === "OPEN");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const totalPaid = completed.reduce((s, t) => s + t.remuneration, 0);
  const pendingAppsCount = Object.values(applicationsByTask).flat().filter((a) => a.status === "PENDING").length;

  function actionFor(t) {
    if (t.status === "OPEN") {
      const apps = applicationsByTask[t.id] || [];
      return apps.length > 0
        ? <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/company/applicants/${t.id}`)}>Review {apps.length} applicant{apps.length > 1 ? "s" : ""} →</button>
        : <span className="text-faint text-sm">Waiting for applicants</span>;
    }
    if (t.status === "IN_PROGRESS") {
      return t.contractStatus === "SIGNED"
        ? <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/workspace/${t.id}`)}>Open workspace →</button>
        : <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/contracts/${t.id}`)}>Continue contract →</button>;
    }
    return <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/workspace/${t.id}`)}>View summary</button>;
  }

  return (
    <div className="section-tight">
      <div className="container">
        <div className="dash-head">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h2>{user.companyName}</h2>
          </div>
          <div className="flex-gap">
            <VerifiedBadge verified={user.verified} type="vat" />
            <button className="btn btn-stamp" onClick={() => router.push("/company/post-task")}>+ Post a task</button>
          </div>
        </div>
        {!loaded ? <p className="text-faint">Loading…</p> : (
          <>
            <div className="stat-row">
              <div className="stat-card"><div className="stat-num">{open.length}</div><div className="stat-label">Open tasks</div></div>
              <div className="stat-card"><div className="stat-num">{inProgress.length}</div><div className="stat-label">In progress</div></div>
              <div className="stat-card"><div className="stat-num">{pendingAppsCount}</div><div className="stat-label">Applicants to review</div></div>
              <div className="stat-card"><div className="stat-num">{money(totalPaid)}</div><div className="stat-label">Paid out (completed)</div></div>
            </div>

            {tasks.length === 0 && <div className="empty-state"><h3>No tasks yet</h3><p>Post your first task to start receiving student applications.</p><button className="btn btn-stamp mt-16" onClick={() => router.push("/company/post-task")}>Post a task</button></div>}

            <div className="list-stack">
              {tasks.map((t) => (
                <div key={t.id} className="card card-pad">
                  <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div className="eyebrow">{t.industry} · {t.deliverableType}</div>
                      <h3 style={{ fontSize: "17px", margin: "4px 0" }}>{t.title}</h3>
                      <Pipeline task={t} contractStatus={t.contractStatus} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {taskStatusBadge(t)}
                      <div className="mt-16">{actionFor(t)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
