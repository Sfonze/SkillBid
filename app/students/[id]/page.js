"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/Providers";
import { VerifiedBadge, StarRow } from "@/components/ui";
import { initials, fmtDate } from "@/lib/format";

function StatPill({ label, value, sub }) {
  return (
    <div className="student-stat-pill">
      <div className="student-stat-value">{value}</div>
      {sub && <div className="student-stat-sub">{sub}</div>}
      <div className="student-stat-label">{label}</div>
    </div>
  );
}

export default function StudentProfile({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/student/${id}`)
      .then((r) => r.json())
      .then((d) => { setStudent(d.student || null); setLoaded(true); });
  }, [id]);

  if (!loaded) return <div className="container section">Loading…</div>;
  if (!student) return <div className="container section">Student not found.</div>;

  const isOwnProfile = user?.role === "STUDENT" && user.id === student.id;
  const firstName = (student.fullName || "").split(" ")[0] || "this student";

  return (
    <div>
      {/* ── HEADER BAND ── */}
      <div className="student-profile-header">
        <div className="container" style={{ maxWidth: "960px" }}>
          <button
            className="profile-back-btn"
            onClick={() => router.push("/talent")}
          >
            ← Browse talent
          </button>

          <div className="student-profile-header-inner">
            <div className="student-profile-header-left">
              {student.avatarUrl
                ? <img src={student.avatarUrl} alt={student.fullName} className="student-profile-avatar" />
                : (
                  <div className="student-profile-avatar-initials">
                    {initials(student.fullName)}
                  </div>
                )
              }
              <div>
                <h1 className="student-profile-name">{student.fullName}</h1>
                {student.headline && <div className="student-profile-headline">{student.headline}</div>}
                {student.degree && <div className="student-profile-degree">{student.degree}</div>}

                <div className="student-profile-badges">
                  <VerifiedBadge verified={student.verified} type="uni" />
                  {student.university && <span className="profile-meta-chip">🎓 {student.university}</span>}
                  {student.location && <span className="profile-meta-chip">📍 {student.location}</span>}
                  {student.responseTime && <span className="profile-meta-chip">⚡ Responds {student.responseTime}</span>}
                </div>
              </div>
            </div>

            <div className="student-profile-header-actions">
              {isOwnProfile && (
                <>
                  <button className="btn btn-ghost btn-sm profile-btn-light" onClick={() => router.push("/student/profile/edit")}>
                    Edit profile
                  </button>
                  <Link href={`/students/${id}/cv`} className="btn btn-stamp btn-sm">
                    Download CV
                  </Link>
                </>
              )}
              {!isOwnProfile && (
                <Link href={`/students/${id}/cv`} className="btn btn-stamp btn-sm">
                  View CV
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT ROW ── */}
      <div className="container" style={{ maxWidth: "960px" }}>
        <div className="student-stat-row">
          <StatPill label="Tasks completed" value={student.completedTasksCount} />
          <StatPill
            label="Average rating"
            value={student.rating ? student.rating.toFixed(1) : "New"}
            sub={student.rating ? "★★★★★".slice(0, Math.round(student.rating)) : null}
          />
          <StatPill
            label="Availability"
            value={student.hoursPerWeek ? `${student.hoursPerWeek}h` : "Flexible"}
            sub={student.hoursPerWeek ? "per week" : null}
          />
          <StatPill
            label="Available from"
            value={student.availableFrom ? fmtDate(student.availableFrom) : "Now"}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="section-tight">
        <div className="container" style={{ maxWidth: "960px" }}>
          <div className="profile-grid">
            <div className="profile-main-col">

              {/* About */}
              {student.bio ? (
                <div className="profile-section-card">
                  <div className="profile-section-label">About</div>
                  <p className="profile-body-text">{student.bio}</p>
                </div>
              ) : isOwnProfile && (
                <div className="profile-section-card profile-empty-card">
                  <p className="text-faint">You have not added an about section yet. <button className="btn-text" onClick={() => router.push("/student/profile/edit")}>Add one →</button></p>
                </div>
              )}

              {/* Education */}
              {(student.degree || student.university) && (
                <div className="profile-section-card">
                  <div className="profile-section-label">Education</div>
                  <div className="education-row">
                    <div className="education-icon">🎓</div>
                    <div>
                      {student.degree && <div className="education-degree">{student.degree}</div>}
                      {student.university && <div className="education-uni">{student.university}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Skill bars */}
              {student.skillLevels?.length > 0 && (
                <div className="profile-section-card">
                  <div className="profile-section-label">Top skills</div>
                  <div className="skill-bars-list">
                    {student.skillLevels.map((s) => (
                      <div key={s.name} className="skill-bar-row">
                        <div className="flex-between">
                          <span style={{ fontWeight: 600, fontSize: "14px" }}>{s.name}</span>
                          <span className="text-faint text-sm">{s.level}%</span>
                        </div>
                        <div className="skill-bar-track">
                          <div className="skill-bar-fill" style={{ width: `${s.level}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All skills */}
              {student.skills?.length > 0 && (
                <div className="profile-section-card">
                  <div className="profile-section-label">All skills & tools</div>
                  <div className="talent-tags">
                    {student.skills.map((sk) => <span key={sk} className="talent-tag">{sk}</span>)}
                  </div>
                </div>
              )}

              {/* Languages */}
              {student.languages?.length > 0 && (
                <div className="profile-section-card">
                  <div className="profile-section-label">Languages</div>
                  <div className="talent-tags">
                    {student.languages.map((l) => <span key={l} className="talent-tag lang-tag">{l}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <div>
              <div className="profile-sidebar-card">
                <h3 style={{ fontSize: "17px", color: "#FFFFFF", marginBottom: "8px" }}>
                  Interested in {firstName}?
                </h3>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.65, marginBottom: "18px" }}>
                  Post a task and students like {firstName} can apply directly. Once you accept, you manage everything through milestones with payment handled at each step.
                </p>
                {user?.role === "SME" && (
                  <button className="btn btn-block profile-sidebar-cta" onClick={() => router.push("/company/post-task")}>
                    Post a task →
                  </button>
                )}
                {!user && (
                  <button className="btn btn-block profile-sidebar-cta" onClick={() => router.push("/signup/company")}>
                    Sign up as a company →
                  </button>
                )}
                {isOwnProfile && (
                  <Link href={`/students/${id}/cv`} className="btn btn-block profile-sidebar-cta" style={{ display: "block", textAlign: "center" }}>
                    Download my CV →
                  </Link>
                )}
              </div>

              {/* Quick stats card */}
              <div className="profile-quick-stats">
                <div className="profile-quick-stat-row">
                  <span className="text-faint text-sm">Verified via</span>
                  <span className="text-sm" style={{ fontWeight: 600 }}>{student.verified ? student.university : "Pending"}</span>
                </div>
                {student.completedTasksCount > 0 && (
                  <div className="profile-quick-stat-row">
                    <span className="text-faint text-sm">Tasks done</span>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{student.completedTasksCount}</span>
                  </div>
                )}
                {student.rating && (
                  <div className="profile-quick-stat-row">
                    <span className="text-faint text-sm">Avg. rating</span>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{student.rating.toFixed(1)} / 5.0</span>
                  </div>
                )}
                {student.hoursPerWeek && (
                  <div className="profile-quick-stat-row">
                    <span className="text-faint text-sm">Availability</span>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{student.hoursPerWeek}h / week</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
