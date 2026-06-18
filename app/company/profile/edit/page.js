"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import { initials } from "@/lib/format";

const SIZES = ["1-5 employees","6-15 employees","16-50 employees","51-200 employees","200+ employees"];
const INDUSTRIES = ["Logistics & Supply Chain","Marketing & Communications","Legal & Compliance","Technology & Software","Design & Creative","Finance & Accounting","Research & Consulting","Retail & E-commerce","Healthcare","Education","Other"];

export default function EditCompanyProfile() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ bio: "", logoUrl: "", location: "", website: "", industry: "", companySize: "" });
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoaded && user?.role !== "SME") { router.push("/login"); return; }
    if (!user) return;
    fetch("/api/profile/sme/me").then((r) => r.json()).then((d) => {
      const s = d.sme;
      if (s) setForm({ bio: s.bio || "", logoUrl: s.logoUrl || "", location: s.location || "", website: s.website || "", industry: s.industry || "", companySize: s.companySize || "" });
      setLoaded(true);
    });
  }, [authLoaded, user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/profile/sme/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.ok) { pushToast("Profile updated.", "sage"); router.push(`/companies/${user.id}`); }
    else pushToast("Something went wrong saving your profile.", "clay");
  }

  if (!authLoaded || !user || !loaded) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "680px" }}>
        <div className="eyebrow">Your company profile</div>
        <h2 className="mt-8">Edit your public profile</h2>
        <p className="section-sub mt-8" style={{ marginBottom: "28px" }}>This is what students see when deciding whether to apply to your tasks.</p>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="profile-edit-avatar-row">
              {form.logoUrl ? <img src={form.logoUrl} alt="" className="profile-edit-avatar" /> : <div className="avatar profile-edit-avatar">{initials(user.companyName)}</div>}
              <div style={{ flex: 1 }}>
                <label className="field-label">Logo URL (optional)</label>
                <input className="input" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
                <div className="field-hint">Paste a link to your logo. Leave blank to show your initials instead.</div>
              </div>
            </div>

            <div className="profile-edit-section-title">Company overview</div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Industry</label>
                <select className="select" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Company size</label>
                <select className="select" value={form.companySize} onChange={(e) => set("companySize", e.target.value)}>
                  <option value="">Select size</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Location</label>
                <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Maastricht, Netherlands" />
              </div>
              <div className="field">
                <label className="field-label">Website (optional)</label>
                <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourcompany.com" />
              </div>
            </div>

            <div className="profile-edit-section-title">About your company</div>
            <div className="field">
              <label className="field-label">Description</label>
              <textarea className="textarea" style={{ minHeight: "140px" }} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="What does your company do, who are your clients, what kind of work do students typically help with? The more specific you are, the better applicants you attract." />
              <div className="field-hint">Students use this to decide if they are a good fit before applying. Aim for 3-5 sentences.</div>
            </div>

            <button className="btn btn-stamp btn-block mt-24" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save profile"}</button>
          </form>
        </div>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
