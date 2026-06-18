"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/Providers";
import { LANGUAGES } from "@/lib/validators";

export default function SignupStudent() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ fullName: "", universityEmail: "", university: "", languages: [], skills: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleLang = (lang) => setForm((f) => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter((l) => l !== lang) : [...f.languages, lang] }));

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.universityEmail)) e.universityEmail = "Enter a valid email address.";
    if (!form.university.trim()) e.university = "Tell us your university.";
    if (form.languages.length === 0) e.languages = "Pick at least one language.";
    if (form.password.length < 6) e.password = "Use at least 6 characters.";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const res = await fetch("/api/auth/signup-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors({ form: data.error || "Something went wrong." });
      return;
    }
    await refreshUser();
    router.push("/tasks");
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-head"><h1>Create your student account</h1><p>Use your university email, it&apos;s how we verify you&apos;re enrolled.</p></div>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Full name</label>
                <input className={"input" + (errors.fullName ? " has-error" : "")} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Anna de Vries" />
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>
              <div className="field">
                <label className="field-label">University</label>
                <input className={"input" + (errors.university ? " has-error" : "")} value={form.university} onChange={(e) => set("university", e.target.value)} placeholder="Maastricht University" />
                {errors.university && <div className="field-error">{errors.university}</div>}
              </div>
            </div>
            <div className="field">
              <label className="field-label">University email</label>
              <input className={"input" + (errors.universityEmail ? " has-error" : "")} type="email" value={form.universityEmail} onChange={(e) => set("universityEmail", e.target.value)} placeholder="anna.devries@student.maastrichtuniversity.nl" />
              {errors.universityEmail && <div className="field-error">{errors.universityEmail}</div>}
              <div className="field-hint">Recognised domains are verified instantly. Other domains go to manual review.</div>
            </div>
            <div className="field">
              <label className="field-label">Languages you work in</label>
              <div className="flex-gap">
                {LANGUAGES.map((l) => (
                  <label key={l} className="checkbox-row" style={{ border: "1.5px solid var(--line)", borderRadius: "9px", padding: "7px 12px", background: form.languages.includes(l) ? "var(--paper-deep)" : "transparent" }}>
                    <input type="checkbox" checked={form.languages.includes(l)} onChange={() => toggleLang(l)} /> {l}
                  </label>
                ))}
              </div>
              {errors.languages && <div className="field-error">{errors.languages}</div>}
            </div>
            <div className="field">
              <label className="field-label">Skills (comma separated)</label>
              <input className="input" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Market research, Excel, Data analysis" />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input className={"input" + (errors.password ? " has-error" : "")} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            {errors.form && <div className="field-error mt-8">{errors.form}</div>}
            <button className="btn btn-sage btn-block mt-8" type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create student account"}</button>
          </form>
        </div>
        <div className="auth-switch">Already have an account? <Link href="/login" style={{ fontWeight: 600, textDecoration: "underline" }}>Log in</Link></div>
      </div>
    </div>
  );
}
