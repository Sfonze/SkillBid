"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { Pipeline, VerifiedBadge, StarRow } from "@/components/ui";
import { money } from "@/lib/validators";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoaded && user?.role !== "STUDENT") { router.push("/login?role=student"); return; }
    if (!user) return;
    Promise.all([
      fetch("/api/tasks?allocatedToMe=1").then((r) => r.json()),
      fetch("/api/applications?mine=1").then((r) => r.json()),
    ]).then(([taskData, appData]) => {
      setTasks(taskData.tasks || []);
      setPendingAppsCount((appData.applications || []).filter((a) => a.status === "PENDING").length);
      setLoaded(true);
    });
  }, [authLoaded, user]);

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;

  const active = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const netEarned = completed.reduce((sum, t) => sum + (t.contractNetToStudent || 0), 0);

  return (
    <div className="section-tight">
      <div className="container">
        <div className="dash-head">
          <div>
            <div className="eyebrow">My tasks</div>
            <h2>Welcome back, {user.fullName?.split(" ")[0]}</h2>
          </div>
          <div className="flex-gap">
            <VerifiedBadge verified={user.verified} type="uni" />
            <StarRow score={user.rating} />
            <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/students/${user.id}`)}>View my profile</button>
          </div>
        </div>
        {!loaded ? <p className="text-faint">Loading…</p> : (
          <>
            <div className="stat-row">
              <div className="stat-card"><div className="stat-num">{active.length}</div><div className="stat-label">Active tasks</div></div>
              <div className="stat-card"><div className="stat-num">{completed.length}</div><div className="stat-label">Completed</div></div>
              <div className="stat-card"><div className="stat-num">{pendingAppsCount}</div><div className="stat-label">Pending applications</div></div>
              <div className="stat-card"><div className="stat-num">{money(netEarned)}</div><div className="stat-label">Net earned (via Adecco)</div></div>
            </div>

            <h3 style={{ fontSize: "18px", marginBottom: "14px" }}>Active</h3>
            {active.length === 0 && <div className="empty-state mt-16" style={{ marginBottom: "32px" }}><h3>Nothing in progress</h3><p>Apply to open tasks to get started.</p></div>}
            <div className="list-stack mt-16" style={{ marginBottom: "32px" }}>
              {active.map((t) => (
                <div key={t.id} className="card card-pad">
                  <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div className="eyebrow">{t.smeCompanyName}</div>
                      <h3 style={{ fontSize: "17px", margin: "4px 0" }}>{t.title}</h3>
                      <Pipeline task={t} contractStatus={t.contractStatus} />
                    </div>
                    {t.contractStatus === "SIGNED"
                      ? <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/workspace/${t.id}`)}>Open workspace →</button>
                      : <button className="btn btn-stamp btn-sm" onClick={() => router.push(`/contracts/${t.id}`)}>Finish contract →</button>}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "18px", marginBottom: "14px" }}>Completed</h3>
            {completed.length === 0 && <div className="empty-state mt-16"><h3>No completed tasks yet</h3></div>}
            <div className="list-stack mt-16">
              {completed.map((t) => (
                <div key={t.id} className="card card-pad">
                  <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div className="eyebrow">{t.smeCompanyName}</div>
                      <h3 style={{ fontSize: "17px", margin: "4px 0" }}>{t.title}</h3>
                      <div className="text-faint text-sm">Net paid: {money(t.contractNetToStudent || 0)}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/workspace/${t.id}`)}>View</button>
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
