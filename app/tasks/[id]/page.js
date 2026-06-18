"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast } from "@/components/Providers";
import { taskStatusBadge, VerifiedBadge, Modal } from "@/components/ui";
import { fmtDate, dueLabel, ageLabel } from "@/lib/format";
import { money } from "@/lib/validators";

export default function TaskDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [data, setData] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [showApply, setShowApply] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/tasks/${id}`);
    if (res.ok) setData(await res.json());
  }
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetch("/api/applications?mine=1").then((r) => r.json()).then((d) => setMyApplications(d.applications || []));
    }
  }, [user]);

  if (!data) return <div className="container section">Loading…</div>;
  const { task, sme } = data;
  const alreadyApplied = myApplications.some((a) => a.taskId === task.id);

  async function submitApplication(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, coverNote: note }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Something went wrong.");
      return;
    }
    setShowApply(false);
    pushToast('Application sent — track it from "My applications".', "sage");
    setMyApplications((apps) => [...apps, { taskId: task.id }]);
  }

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "820px" }}>
        <button className="btn-text" onClick={() => router.push("/tasks")}>← Back to tasks</button>
        <div className="flex-between mt-16" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="eyebrow">{task.industry} · {task.deliverableType}</div>
            <h1 style={{ fontSize: "28px", marginTop: "8px" }}>{task.title}</h1>
            <div className="text-soft mt-8"><Link href={`/companies/${task.smeId}`} style={{ textDecoration: "underline" }}>{sme.companyName}</Link> <VerifiedBadge verified={sme.verified} type="vat" /></div>
          </div>
          {taskStatusBadge(task)}
        </div>

        <div className="card card-pad mt-24">
          <div className="doc-row"><span className="text-faint">Deliverable</span><span>{task.deliverableType}</span></div>
          <div className="doc-row"><span className="text-faint">Language</span><span>{task.language}</span></div>
          <div className="doc-row"><span className="text-faint">Due date</span><span>{fmtDate(task.dueDate)} · {dueLabel(task.dueDate)}</span></div>
          <div className="doc-row"><span className="text-faint">Remuneration</span><span>{money(task.remuneration)} (gross, via Adecco payroll)</span></div>
          <div className="doc-row"><span className="text-faint">Posted</span><span>{ageLabel(task.postedAt)}</span></div>
        </div>

        <h3 style={{ fontSize: "18px", marginTop: "28px", marginBottom: "10px" }}>What they need</h3>
        <p className="text-soft" style={{ lineHeight: 1.7 }}>{task.description}</p>

        <h3 style={{ fontSize: "18px", marginTop: "28px", marginBottom: "10px" }}>Milestones</h3>
        <div className="card card-pad">
          {task.milestones.map((m, i) => (
            <div key={m.id} className="doc-row"><span>{i + 1}. {m.title}</span><span className="text-faint">{fmtDate(m.dueDate)}</span></div>
          ))}
        </div>

        <div className="mt-32">
          {!user && <button className="btn btn-stamp" onClick={() => router.push("/signup/student")}>Sign up as a student to apply</button>}
          {user?.role === "SME" && <p className="text-faint text-sm">Log in as a student to apply to this task.</p>}
          {user?.role === "STUDENT" && alreadyApplied && <span className="badge badge-stamp"><span className="badge-dot"></span>You&apos;ve already applied to this task</span>}
          {user?.role === "STUDENT" && !alreadyApplied && task.status === "OPEN" && <button className="btn btn-stamp" onClick={() => setShowApply(true)}>Apply to this task</button>}
          {user?.role === "STUDENT" && task.status !== "OPEN" && <p className="text-faint text-sm">This task is no longer accepting applications.</p>}
        </div>

        {showApply && (
          <Modal title={`Apply to "${task.title}"`} onClose={() => setShowApply(false)}>
            <form onSubmit={submitApplication}>
              <div className="field">
                <label className="field-label">Short note to {sme.companyName}</label>
                <textarea className="textarea" required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why you're a good fit, relevant experience, availability…" />
              </div>
              {error && <div className="field-error mt-8">{error}</div>}
              <button className="btn btn-stamp btn-block" type="submit">Send application</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
