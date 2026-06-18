"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/Providers";

export default function SignupSme() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ companyName: "", foundationDate: "", vatNumber: "", coreBusiness: "", tasksCompletedBefore: "0", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.foundationDate) e.foundationDate = "Foundation date is required.";
    if (!form.vatNumber.trim()) e.vatNumber = "VAT number is required.";
    if (!form.coreBusiness.trim()) e.coreBusiness = "Tell students what your company does.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 6) e.password = "Use at least 6 characters.";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const res = await fetch("/api/auth/signup-sme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tasksCompletedBefore: Number(form.tasksCompletedBefore) || 0 }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors({ form: data.error || "Something went wrong." });
      return;
    }
    await refreshUser();
    router.push("/company/dashboard");
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-head"><h1>Set up your company account</h1><p>This information helps students trust who they&apos;re working with.</p></div>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label">Company name</label>
              <input className={"input" + (errors.companyName ? " has-error" : "")} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Greenfields Logistics B.V." />
              {errors.companyName && <div className="field-error">{errors.companyName}</div>}
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Foundation date</label>
                <input className={"input" + (errors.foundationDate ? " has-error" : "")} type="date" value={form.foundationDate} onChange={(e) => set("foundationDate", e.target.value)} />
                {errors.foundationDate && <div className="field-error">{errors.foundationDate}</div>}
              </div>
              <div className="field">
                <label className="field-label">VAT number</label>
                <input className={"input" + (errors.vatNumber ? " has-error" : "")} value={form.vatNumber} onChange={(e) => set("vatNumber", e.target.value.toUpperCase())} placeholder="NL123456789B01" />
                {errors.vatNumber && <div className="field-error">{errors.vatNumber}</div>}
                <div className="field-hint">We check the format automatically. A real VAT registry check would run before going live.</div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Core business</label>
              <input className={"input" + (errors.coreBusiness ? " has-error" : "")} value={form.coreBusiness} onChange={(e) => set("coreBusiness", e.target.value)} placeholder="e.g. Sustainable freight & last-mile logistics" />
              {errors.coreBusiness && <div className="field-error">{errors.coreBusiness}</div>}
            </div>
            <div className="field">
              <label className="field-label">Tasks completed before SkillBid (rough number)</label>
              <input className="input" type="number" min="0" value={form.tasksCompletedBefore} onChange={(e) => set("tasksCompletedBefore", e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Work email</label>
                <input className={"input" + (errors.email ? " has-error" : "")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input className={"input" + (errors.password ? " has-error" : "")} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>
            </div>
            {errors.form && <div className="field-error mt-8">{errors.form}</div>}
            <button className="btn btn-stamp btn-block mt-8" type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create company account"}</button>
          </form>
        </div>
        <div className="auth-switch">Already have an account? <Link href="/login" style={{ fontWeight: 600, textDecoration: "underline" }}>Log in</Link></div>
      </div>
    </div>
  );
}
