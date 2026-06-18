"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { VerifiedBadge, StarRow } from "@/components/ui";
import { initials, fmtDate } from "@/lib/format";

function StatPill({ label, value }) {
  return (
    <div className="student-stat-pill">
      <div className="student-stat-value">{value}</div>
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
    fetch(`/api/profile/student/${id}`).then((r) => r.json()).then((d) => { setStudent(d.student || null); setLoaded(true); });
  }, [id]);

  if (!loaded) return <div className="container section">Loading…</div>;
  if (!student) return <div className="container section">Student not found.</div>;

  const isOwnProfile = user?.role === "STUDENT" && user.id === student.id;

  return (
    <div>
      <div className="student-profile-header">
        <div className="container" style={{ maxWidth: "900px" }}>
          <button className="btn-text" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "20px" }} onClick={() => router.push("/talent")}>← Back to talent</button>
          <div className="student-profile-header-inner">
            <div className="student-profile-header-left">
              {student.avatarUrl
                ? <img src={student.avatarUrl} alt={student.fullName} className="student-profile-avatar" />
                : <div className="avatar student-profile-avatar-fallback">{initials(student.fullName)}</div>}
              <div>
                <h1 style={{ fontSize: "26px", color: "#FFFFFF", marginBottom: "4px" }}>{student.fullName}</h1>
                {student.headline && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", marginBottom: "8px" }}>{student.headline}</div>}
                {student.degree && <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", marginBottom: "8px" }}>{student.degree}</div>}
                <div className="flex-gap" style={{ flexWrap: "wrap", gap: "10px" }}>
                  <VerifiedBadge verified={student.verified} type="uni" />
                  {student.university && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>🎓 {student.university}</span>}
                  {student.location && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>📍 {student.location}</span>}
                  {student.responseTime && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>⏱ Responds {student.responseTime}</span>}
                </div>
              </div>
            </div>
            <div className="student-profile-header-right">
              {isOwnProfile
                ? <button className="btn btn-ghost btn-sm btn-ghost.nav-ghost-btn" onClick={() => router.push("/student/profile/edit")}>Edit profile</button>
                : user?.role === "SME" && (
                  <button className="btn btn-stamp btn-sm" onClick={() => router.push("/company/post-task")}>Post a task</button>
                )
              }
            </div>
          </div>
        </div>
      </div>

      <div className="section-tight">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="student-stat-row">
            <StatPill label="Tasks completed" value={student.completedTasksCount} />
            <StatPill label="Average rating" value={student.rating ? `${student.rating.toFixed(1)} ★` : "New"} />
            <StatPill label="Hours available" value={student.hoursPerWeek ? `${student.hoursPerWeek}h/week` : "Flexible"} />
            <StatPill label="Available from" value={student.availableFrom ? fmtDate(student.availableFrom) : "Now"} />
          </div>

          <div className="profile-grid mt-32">
            <div>
              {student.bio && (
                <div className="card card-pad">
                  <div className="eyebrow" style={{ marginBottom: "12px" }}>About</div>
                  <p className="text-soft" style={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{student.bio}</p>
                </div>
              )}

              {student.skillLevels?.length > 0 && (
                <div className="card card-pad mt-18">
                  <div className="eyebrow" style={{ marginBottom: "16px" }}>Top skills</div>
                  {student.skillLevels.map((s) => (
                    <div key={s.name} className="skill-bar-row">
                      <div className="flex-between">
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>{s.name}</span>
                        <span className="text-faint text-sm">{s.level}%</span>
                      </div>
                      <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${s.level}%` }}></div></div>
                    </div>
                  ))}
                </div>
              )}

              {student.skills?.length > 0 && (
                <div className="card card-pad mt-18">
                  <div className="eyebrow" style={{ marginBottom: "12px" }}>All skills & tools</div>
                  <div className="talent-tags">{student.skills.map((sk) => <span key={sk} className="talent-tag">{sk}</span>)}</div>
                </div>
              )}

              {student.languages?.length > 0 && (
                <div className="card card-pad mt-18">
                  <div className="eyebrow" style={{ marginBottom: "12px" }}>Languages</div>
                  <div className="talent-tags">{student.languages.map((l) => <span key={l} className="talent-tag">{l}</span>)}</div>
                </div>
              )}
            </div>

            <div className="profile-sidebar-card">
              <h3 style={{ fontSize: "17px", color: "#FFFFFF", marginBottom: "10px" }}>Interested in {student.fullName.split(" ")[0]}?</h3>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.65, marginBottom: "20px" }}>
                Post a task and students like {student.fullName.split(" ")[0]} can apply directly. Once you accept an application, you can message them and track work milestone by milestone.
              </p>
              {user?.role === "SME"
                ? <button className="btn btn-block" style={{ background: "#FFFFFF", color: "var(--nav-navy)", fontWeight: 700 }} onClick={() => router.push("/company/post-task")}>Post a task →</button>
                : !user && <button className="btn btn-block" style={{ background: "#FFFFFF", color: "var(--nav-navy)", fontWeight: 700 }} onClick={() => router.push("/signup/company")}>Sign up as a company →</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
