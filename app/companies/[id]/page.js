"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { VerifiedBadge } from "@/components/ui";
import { fmtDate, initials } from "@/lib/format";

export default function CompanyProfile({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [sme, setSme] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/sme/${id}`).then((r) => r.json()).then((d) => { setSme(d.sme || null); setLoaded(true); });
  }, [id]);

  if (!loaded) return <div className="container section">Loading…</div>;
  if (!sme) return <div className="container section">Company not found.</div>;

  const isOwnProfile = user?.role === "SME" && user.id === sme.id;

  return (
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "880px" }}>
        <button className="btn-text" onClick={() => router.push("/tasks")}>← Back to tasks</button>

        <div className="profile-header mt-24">
          {sme.logoUrl ? <img src={sme.logoUrl} alt={sme.companyName} className="profile-avatar" /> : <div className="avatar profile-avatar-fallback">{initials(sme.companyName)}</div>}
          <div style={{ flex: 1 }}>
            <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h1 style={{ fontSize: "26px" }}>{sme.companyName}</h1>
                <div className="text-soft mt-8">{sme.coreBusiness}</div>
              </div>
              {isOwnProfile && <button className="btn btn-ghost btn-sm" onClick={() => router.push("/company/profile/edit")}>Edit profile</button>}
            </div>
            <div className="flex-gap mt-16">
              <VerifiedBadge verified={sme.verified} type="vat" />
              {sme.location && <span className="text-faint text-sm">📍 {sme.location}</span>}
              {sme.foundationDate && <span className="text-faint text-sm">🏢 Founded {fmtDate(sme.foundationDate)}</span>}
            </div>
          </div>
        </div>

        <div className="stat-row mt-32">
          <div className="stat-card"><div className="stat-num">{sme.tasksCompletedBefore}</div><div className="stat-label">Tasks completed on SkillBid</div></div>
          <div className="stat-card" style={{ gridColumn: "span 3" }}><div className="stat-num" style={{ fontSize: "16px" }}>{sme.vatNumber}</div><div className="stat-label">VAT number</div></div>
        </div>

        {sme.bio && (
          <div className="card card-pad mt-32">
            <div className="eyebrow" style={{ marginBottom: "12px" }}>About</div>
            <p className="text-soft" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{sme.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
