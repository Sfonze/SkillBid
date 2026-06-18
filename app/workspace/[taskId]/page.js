"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { taskStatusBadge, Pipeline } from "@/components/ui";
import MilestoneRow from "@/components/MilestoneRow";
import RatingPrompt from "@/components/RatingPrompt";
import { fmtDateTime } from "@/lib/format";
import { money, COMMISSION_RATE } from "@/lib/validators";

export default function Workspace({ params }) {
  const { taskId } = params;
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const [task, setTask] = useState(null);
  const [sme, setSme] = useState(null);
  const [student, setStudent] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [ratingSkipped, setRatingSkipped] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const [taskRes, msgRes, ratingRes] = await Promise.all([
      fetch(`/api/tasks/${taskId}`),
      fetch(`/api/messages?taskId=${taskId}`),
      fetch(`/api/ratings?taskId=${taskId}`),
    ]);
    if (taskRes.ok) {
      const d = await taskRes.json();
      setTask(d.task); setSme(d.sme); setStudent(d.student);
    }
    if (msgRes.ok) setMessages((await msgRes.json()).messages);
    if (ratingRes.ok) setRatings((await ratingRes.json()).ratings);
    if (taskRes.ok) {
      const d2 = await (await fetch(`/api/contracts/${taskId}`)).json().catch(() => null);
      if (d2 && d2.contract) setContractStatus(d2.contract.status);
    }
    setLoaded(true);
  }

  useEffect(() => { if (user) load(); }, [user]);

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;
  if (!loaded || !task) return <div className="container section">Loading…</div>;

  const isSme = user.role === "SME" && user.id === sme.id;
  const isStudent = user.role === "STUDENT" && student && user.id === student.id;
  if (!isSme && !isStudent) return <div className="container section">You don&apos;t have access to this workspace.</div>;

  const myRatingGiven = ratings.some((r) => r.fromRole === user.role);
  const showRatingPrompt = task.status === "COMPLETED" && !myRatingGiven && !ratingSkipped;

  async function submitMilestoneDeliverable(msId, note) {
    await fetch(`/api/milestones/${msId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
    load();
  }
  async function approveMilestone(msId) {
    await fetch(`/api/milestones/${msId}/approve`, { method: "POST" });
    load();
  }
  async function requestChanges(msId, note) {
    await fetch(`/api/milestones/${msId}/request-changes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
    load();
  }
  async function sendMessage(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, text: msgText.trim() }) });
    setMsgText("");
    load();
  }
  async function submitRating(score, comment) {
    await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, score, comment }) });
    load();
  }

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "780px" }}>
        <button className="btn-text" onClick={() => router.push(isSme ? "/company/dashboard" : "/student/dashboard")}>← Back to dashboard</button>
        <div className="dash-head mt-16">
          <div>
            <div className="eyebrow">{sme.companyName}{student && <> · {student.fullName}</>}</div>
            <h2>{task.title}</h2>
            <Pipeline task={task} contractStatus={contractStatus} />
          </div>
          {taskStatusBadge(task)}
        </div>

        <h3 style={{ fontSize: "18px", marginTop: "28px", marginBottom: "4px" }}>Milestones</h3>
        <div className="card card-pad mt-16">
          {task.milestones.map((m, i) => (
            <MilestoneRow key={m.id} milestone={m} index={i} isSme={isSme} isStudent={isStudent}
              onSubmit={submitMilestoneDeliverable} onApprove={approveMilestone} onRequestChanges={requestChanges} />
          ))}
        </div>

        {task.status === "COMPLETED" && (
          <div className="card card-pad mt-24" style={{ background: "var(--sage-light)", borderColor: "var(--sage)" }}>
            <strong>Task completed.</strong> {money(task.remuneration)} gross, {money(Math.round(task.remuneration * (1 - COMMISSION_RATE) * 100) / 100)} net to {student.fullName.split(" ")[0]} after SkillBid&apos;s 15% commission.
          </div>
        )}

        <h3 style={{ fontSize: "18px", marginTop: "28px", marginBottom: "12px" }}>Messages</h3>
        <div className="card card-pad">
          <div className="msg-thread">
            {messages.length === 0 && <div className="text-faint text-sm">No messages yet, say hello.</div>}
            {messages.map((m) => {
              const mine = m.fromRole === user.role && m.fromUserId === user.id;
              return (
                <div key={m.id} className={"msg-bubble " + (mine ? "msg-mine" : "msg-theirs")}>
                  {m.text}
                  <div className="msg-time">{fmtDateTime(m.timestamp)}</div>
                </div>
              );
            })}
          </div>
          <form onSubmit={sendMessage} className="flex-gap">
            <input className="input" style={{ flex: 1 }} placeholder="Write a message…" value={msgText} onChange={(e) => setMsgText(e.target.value)} />
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>

        {task.contractId && (
          <div className="mt-24">
            <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/contracts/${task.id}`)}>View signed contract</button>
          </div>
        )}
      </div>

      {showRatingPrompt && <RatingPrompt onSubmit={submitRating} onSkip={() => setRatingSkipped(true)} />}
    </div>
  );
}
