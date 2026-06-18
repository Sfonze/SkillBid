"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { VerifiedBadge, StarRow } from "@/components/ui";
import { initials, fmtDate } from "@/lib/format";

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
    <div className="section-tight">
      <div className="container" style={{ maxWidth: "880px" }}>
        <button className="btn-text" onClick={() => router.push("/talent")}>← Back to talent</button>

        <div className="profile-header mt-24">
          {student.avatarUrl ? <img src={student.avatarUrl} alt={student.fullName} className="profile-avatar" /> : <div className="avatar profile-avatar-fallback">{initials(student.fullName)}</div>}
          <div style={{ flex: 1 }}>
            <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h1 style={{ fontSize: "26px" }}>{student.fullName}</h1>
                <div className="text-soft mt-8">{student.headline || student.university}</div>
              </div>
              {isOwnProfile && <button className="btn btn-ghost btn-sm" onClick={() => router.push("/student/profile/edit")}>Edit profile</button>}
            </div>
            <div className="flex-gap mt-16">
              <VerifiedBadge verified={student.verified} type="uni" />
              {student.location && <span className="text-faint text-sm">📍 {student.location}</span>}
              {student.responseTime && <span className="text-faint text-sm">⏱ Usually responds {student.responseTime}</span>}
            </div>
          </div>
        </div>

        <div className="stat-row mt-32">
          <div className="stat-card"><div className="stat-num">{student.completedTasksCount}</div><div className="stat-label">Tasks completed</div></div>
          <div className="stat-card"><div className="stat-num">{student.rating ? student.rating.toFixed(1) : "—"}</div><div className="stat-label">Average rating</div></div>
          <div className="stat-card"><div className="stat-num">{student.university}</div><div className="stat-label" style={{ textTransform: "none" }}>University</div></div>
          <div className="stat-card"><div className="stat-num">{student.hoursPerWeek ? `${student.hoursPerWeek}h` : "—"}</div><div className="stat-label">Available per week</div></div>
        </div>

        <div className="profile-grid mt-32">
          <div>
            {student.bio && (
              <div className="card card-pad mt-0">
                <div className="eyebrow" style={{ marginBottom: "12px" }}>About</div>
                <p className="text-soft" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{student.bio}</p>
              </div>
            )}

            {student.skillLevels?.length > 0 && (
              <div className="card card-pad mt-24">
                <div className="eyebrow" style={{ marginBottom: "16px" }}>Skills</div>
                {student.skillLevels.map((s) => (
                  <div key={s.name} className="skill-bar-row">
                    <div className="flex-between"><span className="text-sm" style={{ fontWeight: 600 }}>{s.name}</span><span className="text-faint text-sm">{s.level}%</span></div>
                    <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${s.level}%` }}></div></div>
                  </div>
                ))}
              </div>
            )}

            <div className="card card-pad mt-24">
              <div className="eyebrow" style={{ marginBottom: "12px" }}>All skills</div>
              <div className="talent-tags">
                {student.skills.map((sk) => <span key={sk} className="talent-tag">{sk}</span>)}
              </div>
            </div>

            <div className="card card-pad mt-24">
              <div className="eyebrow" style={{ marginBottom: "12px" }}>Languages</div>
              <div className="talent-tags">
                {student.languages.map((l) => <span key={l} className="talent-tag">{l}</span>)}
              </div>
            </div>
          </div>

          <div className="profile-sidebar-card">
            <h3 style={{ fontSize: "17px", color: "#FFFFFF", marginBottom: "10px" }}>Interested in {student.fullName.split(" ")[0]}?</h3>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "14px", lineHeight: 1.6, marginBottom: "18px" }}>
              {student.availableFrom ? `Available from ${fmtDate(student.availableFrom)}, ` : ""}post a task and students like {student.fullName.split(" ")[0]} can apply directly. Once you accept an application, you can message them about the work.
            </p>
            <button className="btn btn-block" style={{ background: "#FFFFFF", color: "var(--nav-navy)" }} onClick={() => router.push("/company/post-task")}>Post a task</button>
          </div>
        </div>
      </div>
    </div>
  );
}
