"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import DeleteAccountSection from "@/components/DeleteAccountSection";

export default function EditStudentProfile() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ headline: "", bio: "", location: "", avatarUrl: "", responseTime: "", availableFrom: "", hoursPerWeek: "" });
  const [skillLevels, setSkillLevels] = useState([{ name: "", level: 70 }]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoaded && user?.role !== "STUDENT") { router.push("/login?role=student"); return; }
    if (!user) return;
    fetch("/api/profile/student/me").then((r) => r.json()).then((d) => {
      const s = d.student;
      if (s) {
        setForm({
          headline: s.headline || "", bio: s.bio || "", location: s.location || "",
          avatarUrl: s.avatarUrl || "", responseTime: s.responseTime || "",
          availableFrom: s.availableFrom ? String(s.availableFrom).slice(0, 10) : "",
          hoursPerWeek: s.hoursPerWeek || "",
        });
        setSkillLevels(s.skillLevels?.length ? s.skillLevels : [{ name: "", level: 70 }]);
      }
      setLoaded(true);
    });
  }, [authLoaded, user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  function setSkill(i, key, val) { setSkillLevels((sk) => sk.map((s, idx) => (idx === i ? { ...s, [key]: val } : s))); }
  function addSkill() { setSkillLevels((sk) => [...sk, { name: "", level: 70 }]); }
  function removeSkill(i) { setSkillLevels((sk) => (sk.length > 1 ? sk.filter((_, idx) => idx !== i) : sk)); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    const cleanSkills = skillLevels.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), level: Number(s.level) }));
    const res = await fetch("/api/profile/student/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hoursPerWeek: form.hoursPerWeek ? Number(form.hoursPerWeek) : null, skillLevels: cleanSkills }),
    });
    setSubmitting(false);
    if (res.ok) {
      pushToast("Profile updated.", "sage");
      router.push(`/students/${user.id}`);
    } else {
      pushToast("Something went wrong saving your profile.", "clay");
    }
  }

  if (!authLoaded || !user || !loaded) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "680px" }}>
        <div className="eyebrow">Your profile</div>
        <h2 className="mt-8">Edit your public profile</h2>
        <p className="section-sub mt-8" style={{ marginBottom: "28px" }}>This is what companies see when they browse talent or review your applications.</p>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label">Headline</label>
              <input className="input" value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="e.g. Marketing & Research Specialist" />
            </div>
            <div className="field">
              <label className="field-label">About you</label>
              <textarea className="textarea" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A few sentences about your background, what you're good at, and the kind of tasks you enjoy." />
            </div>
            <div className="field">
              <label className="field-label">Profile photo URL (optional)</label>
              <input className="input" value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…" />
              <div className="field-hint">Paste a link to an image you have the rights to use. Leave blank to show your initials instead.</div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Location</label>
                <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Maastricht, Netherlands" />
              </div>
              <div className="field">
                <label className="field-label">Typical response time</label>
                <input className="input" value={form.responseTime} onChange={(e) => set("responseTime", e.target.value)} placeholder="within a few hours" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Available from</label>
                <input className="input" type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Hours per week</label>
                <input className="input" type="number" min="0" max="40" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} placeholder="20" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Top skills</label>
              <div className="text-faint text-sm" style={{ marginBottom: "10px" }}>Shown as progress bars on your profile, rate yourself honestly.</div>
              {skillLevels.map((s, i) => (
                <div key={i} className="flex-gap mt-8" style={{ alignItems: "center" }}>
                  <input className="input" style={{ flex: 2 }} placeholder="Skill name" value={s.name} onChange={(e) => setSkill(i, "name", e.target.value)} />
                  <input type="range" min="0" max="100" value={s.level} onChange={(e) => setSkill(i, "level", e.target.value)} style={{ flex: 1 }} />
                  <span className="text-sm mono" style={{ width: "40px" }}>{s.level}%</span>
                  <button type="button" className="btn btn-text btn-sm" onClick={() => removeSkill(i)}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm mt-16" onClick={addSkill}>+ Add skill</button>
            </div>

            <button className="btn btn-stamp btn-block mt-24" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save profile"}</button>
          </form>
        </div>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
