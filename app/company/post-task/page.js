"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import { INDUSTRIES, LANGUAGES, DELIVERABLE_TYPES } from "@/lib/validators";

export default function PostTask() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", industry: INDUSTRIES[0], language: LANGUAGES[0], deliverableType: DELIVERABLE_TYPES[0], dueDate: "", remuneration: "" });
  const [milestones, setMilestones] = useState([{ title: "", dueDate: "" }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (authLoaded && user?.role !== "SME") router.push("/login");
  }, [authLoaded, user]);

  function setMilestone(i, key, val) {
    setMilestones((ms) => ms.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));
  }
  function addMilestone() { setMilestones((ms) => [...ms, { title: "", dueDate: "" }]); }
  function removeMilestone(i) { setMilestones((ms) => (ms.length > 1 ? ms.filter((_, idx) => idx !== i) : ms)); }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Give the task a clear title.";
    if (!form.description.trim() || form.description.trim().length < 20) e.description = "Describe the deliverable in a bit more detail (20+ characters).";
    if (!form.dueDate) e.dueDate = "Set a due date.";
    if (!form.remuneration || Number(form.remuneration) <= 0) e.remuneration = "Set the remuneration amount.";
    if (milestones.some((m) => !m.title.trim() || !m.dueDate)) e.milestones = "Every milestone needs a title and due date.";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, remuneration: Number(form.remuneration), milestones }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErrors({ form: d.error || "Something went wrong." });
      return;
    }
    pushToast("Task posted — you'll be notified when students apply.", "sage");
    router.push("/company/dashboard");
  }

  if (!authLoaded || !user) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "720px" }}>
        <div className="eyebrow">New task</div>
        <h2 className="mt-8">Describe what you need done</h2>
        <p className="section-sub mt-8" style={{ marginBottom: "28px" }}>Be specific — a clear brief gets better applicants.</p>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label">Task title</label>
              <input className={"input" + (errors.title ? " has-error" : "")} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Market entry research — Benelux e-bike rental" />
              {errors.title && <div className="field-error">{errors.title}</div>}
            </div>
            <div className="field">
              <label className="field-label">Describe the deliverable</label>
              <textarea className={"textarea" + (errors.description ? " has-error" : "")} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What exactly should the student hand over, and what does 'done' look like?" />
              {errors.description && <div className="field-error">{errors.description}</div>}
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Industry</label>
                <select className="select" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Language</label>
                <select className="select" value={form.language} onChange={(e) => set("language", e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Type of deliverable</label>
                <select className="select" value={form.deliverableType} onChange={(e) => set("deliverableType", e.target.value)}>
                  {DELIVERABLE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Due date</label>
                <input className={"input" + (errors.dueDate ? " has-error" : "")} type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
                {errors.dueDate && <div className="field-error">{errors.dueDate}</div>}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Remuneration (gross, €)</label>
              <input className={"input" + (errors.remuneration ? " has-error" : "")} type="number" min="0" value={form.remuneration} onChange={(e) => set("remuneration", e.target.value)} placeholder="450" />
              {errors.remuneration && <div className="field-error">{errors.remuneration}</div>}
              <div className="field-hint">SkillBid&apos;s 15% commission is deducted from this; the rest is paid to the student via Adecco.</div>
            </div>

            <div className="field">
              <label className="field-label">Milestones</label>
              <div className="text-faint text-sm mt-8" style={{ marginBottom: "10px" }}>Break the task into stages so progress is easy to track.</div>
              {milestones.map((m, i) => (
                <div key={i} className="flex-gap mt-8" style={{ alignItems: "flex-start" }}>
                  <input className="input" style={{ flex: 2 }} placeholder={`Milestone ${i + 1} title`} value={m.title} onChange={(e) => setMilestone(i, "title", e.target.value)} />
                  <input className="input" style={{ flex: 1 }} type="date" value={m.dueDate} onChange={(e) => setMilestone(i, "dueDate", e.target.value)} />
                  <button type="button" className="btn btn-text btn-sm" onClick={() => removeMilestone(i)}>Remove</button>
                </div>
              ))}
              {errors.milestones && <div className="field-error">{errors.milestones}</div>}
              <button type="button" className="btn btn-ghost btn-sm mt-16" onClick={addMilestone}>+ Add milestone</button>
            </div>

            {errors.form && <div className="field-error mt-8">{errors.form}</div>}
            <button className="btn btn-stamp btn-block mt-24" type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post task"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
