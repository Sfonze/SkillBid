"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentCV({ params }) {
  const { id } = params;
  const [student, setStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/profile/student/${id}`).then((r) => r.json()).then((d) => {
      if (d.student) setStudent(d.student);
    });
  }, [id]);

  if (!student) return <div style={{ padding: "40px", fontFamily: "Georgia, serif" }}>Loading…</div>;

  return (
    <div className="cv-page">
      <div className="cv-header">
        <div className="cv-header-main">
          <h1 className="cv-name">{student.fullName}</h1>
          {student.headline && <div className="cv-headline">{student.headline}</div>}
          {student.degree && <div className="cv-degree">{student.degree} · {student.university}</div>}
          <div className="cv-meta">
            {student.location && <span>{student.location}</span>}
            {student.responseTime && <span>Responds {student.responseTime}</span>}
            {student.hoursPerWeek && <span>{student.hoursPerWeek}h/week available</span>}
          </div>
        </div>
        <div className="cv-header-actions no-print">
          <button className="btn btn-stamp" onClick={() => window.print()}>Print / Save as PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back to profile</button>
        </div>
      </div>

      {student.bio && (
        <div className="cv-section">
          <div className="cv-section-title">About</div>
          <p className="cv-body">{student.bio}</p>
        </div>
      )}

      {student.skillLevels?.length > 0 && (
        <div className="cv-section">
          <div className="cv-section-title">Skills</div>
          <div className="cv-skills-grid">
            {student.skillLevels.map((s) => (
              <div key={s.name} className="cv-skill-row">
                <div className="cv-skill-name">{s.name}</div>
                <div className="cv-skill-bar-track"><div className="cv-skill-bar-fill" style={{ width: `${s.level}%` }}></div></div>
                <div className="cv-skill-pct">{s.level}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {student.skills?.length > 0 && (
        <div className="cv-section">
          <div className="cv-section-title">Tools & other skills</div>
          <div className="cv-tags">{student.skills.map((s) => <span key={s} className="cv-tag">{s}</span>)}</div>
        </div>
      )}

      {student.languages?.length > 0 && (
        <div className="cv-section">
          <div className="cv-section-title">Languages</div>
          <div className="cv-tags">{student.languages.map((l) => <span key={l} className="cv-tag">{l}</span>)}</div>
        </div>
      )}

      <div className="cv-section">
        <div className="cv-section-title">Track record on SkillBid</div>
        <div className="cv-stats-row">
          <div className="cv-stat"><strong>{student.completedTasksCount}</strong> tasks completed</div>
          {student.rating && <div className="cv-stat"><strong>{student.rating.toFixed(1)} / 5.0</strong> average rating</div>}
          {student.verified && <div className="cv-stat"><strong>University verified</strong> via {student.university}</div>}
        </div>
      </div>

      <div className="cv-footer">Generated via SkillBid · skillbid.com</div>
    </div>
  );
}
