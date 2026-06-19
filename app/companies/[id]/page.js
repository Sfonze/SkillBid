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
    <div>
      <div className="student-profile-header">
        <div className="container" style={{ maxWidth: "900px" }}>
          <button className="profile-back-btn" onClick={() => router.push("/tasks")}>← Back to tasks</button>
          <div className="student-profile-header-inner">
            <div className="student-profile-header-left">
              {sme.logoUrl
                ? <img src={sme.logoUrl} alt={sme.companyName} className="student-profile-avatar" />
                : <div className="student-profile-avatar-initials">{initials(sme.companyName)}</div>}
              <div>
                <h1 style={{ fontSize: "26px", color: "#FFFFFF", marginBottom: "4px" }}>{sme.companyName}</h1>
                {sme.coreBusiness && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", marginBottom: "8px" }}>{sme.coreBusiness}</div>}
                <div className="student-profile-badges">
                  {sme.location && <span className="profile-meta-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>{sme.location}</span>}
                  {sme.industry && <span className="profile-meta-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M6 21V5L12 3L18 5V21"/><path d="M4 21H20"/><path d="M10 21V16H14V21"/></svg>{sme.industry}</span>}
                  {sme.companySize && <span className="profile-meta-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/><circle cx="17" cy="8" r="2.5"/><path d="M21 20c0-2.4-1.6-4.5-3.8-5.2"/></svg>{sme.companySize}</span>}
                  {sme.website && <a href={sme.website} target="_blank" rel="noreferrer" className="profile-meta-chip" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z"/></svg>Website</a>}
                  <VerifiedBadge verified={sme.verified} type="vat" />
                </div>
              </div>
            </div>
            <div className="student-profile-header-actions">
              {isOwnProfile && <button className="btn btn-ghost btn-sm profile-btn-light" onClick={() => router.push("/company/profile/edit")}>Edit profile</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="section-tight">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="student-stat-row">
            <div className="student-stat-pill">
              <div className="student-stat-value">{sme.tasksCompletedBefore}</div>
              <div className="student-stat-label">Tasks completed on SkillBid</div>
            </div>
            {sme.foundationDate && (
              <div className="student-stat-pill">
                <div className="student-stat-value">{new Date(sme.foundationDate).getFullYear()}</div>
                <div className="student-stat-label">Year founded</div>
              </div>
            )}
            {sme.companySize && (
              <div className="student-stat-pill">
                <div className="student-stat-value">{sme.companySize}</div>
                <div className="student-stat-label">Team size</div>
              </div>
            )}
          </div>

          <div className="profile-grid mt-32">
            <div>
              {sme.bio ? (
                <div className="card card-pad">
                  <div className="eyebrow" style={{ marginBottom: "12px" }}>About</div>
                  <p className="text-soft" style={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{sme.bio}</p>
                </div>
              ) : isOwnProfile && (
                <div className="card card-pad" style={{ borderStyle: "dashed" }}>
                  <p className="text-faint">You have not added a company description yet. Students use this to decide whether to apply. <button className="btn-text" onClick={() => router.push("/company/profile/edit")}>Add one now →</button></p>
                </div>
              )}
            </div>

            <div className="profile-sidebar-card">
              <h3 style={{ fontSize: "17px", color: "#FFFFFF", marginBottom: "10px" }}>Looking for student talent?</h3>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.65, marginBottom: "20px" }}>
                Post a task with clear milestones and let verified university students apply. You only pay a 15% commission on completion, no upfront fees.
              </p>
              {user?.role === "SME" && isOwnProfile && (
                <button className="btn btn-block" style={{ background: "#FFFFFF", color: "var(--nav-navy)", fontWeight: 700 }} onClick={() => router.push("/company/post-task")}>Post a task →</button>
              )}
              {!user && (
                <button className="btn btn-block" style={{ background: "#FFFFFF", color: "var(--nav-navy)", fontWeight: 700 }} onClick={() => router.push("/signup/company")}>Sign up as a company →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
