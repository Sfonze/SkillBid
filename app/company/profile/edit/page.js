"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/components/Providers";
import DeleteAccountSection from "@/components/DeleteAccountSection";

export default function EditCompanyProfile() {
  const router = useRouter();
  const { user, authLoaded } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ bio: "", logoUrl: "", location: "" });
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoaded && user?.role !== "SME") { router.push("/login"); return; }
    if (!user) return;
    fetch("/api/profile/sme/me").then((r) => r.json()).then((d) => {
      const s = d.sme;
      if (s) setForm({ bio: s.bio || "", logoUrl: s.logoUrl || "", location: s.location || "" });
      setLoaded(true);
    });
  }, [authLoaded, user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/profile/sme/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.ok) {
      pushToast("Profile updated.", "sage");
      router.push(`/companies/${user.id}`);
    } else {
      pushToast("Something went wrong saving your profile.", "clay");
    }
  }

  if (!authLoaded || !user || !loaded) return <div className="container section">Loading…</div>;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "680px" }}>
        <div className="eyebrow">Your profile</div>
        <h2 className="mt-8">Edit your company profile</h2>
        <p className="section-sub mt-8" style={{ marginBottom: "28px" }}>This is what students see when reviewing your tasks.</p>
        <div className="card card-pad">
          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label">About your company</label>
              <textarea className="textarea" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="What you do, who you serve, and what students typically work on with you." />
            </div>
            <div className="field">
              <label className="field-label">Logo URL (optional)</label>
              <input className="input" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
              <div className="field-hint">Paste a link to your logo. Leave blank to show your initials instead.</div>
            </div>
            <div className="field">
              <label className="field-label">Location</label>
              <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Maastricht, Netherlands" />
            </div>
            <button className="btn btn-stamp btn-block mt-24" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save profile"}</button>
          </form>
        </div>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
