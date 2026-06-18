"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { StarRow } from "@/components/ui";
import { initials } from "@/lib/format";

export default function Talent() {
  const router = useRouter();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");

  useEffect(() => {
    fetch("/api/talent").then((r) => r.json()).then((d) => {
      setStudents(d.students || []);
      setLoaded(true);
    });
  }, []);

  const allSkills = Array.from(new Set(students.flatMap((s) => s.skills || []))).sort();
  const allLangs  = Array.from(new Set(students.flatMap((s) => s.languages || []))).sort();

  let filtered = students;
  if (q.trim()) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((s) =>
      s.fullName.toLowerCase().includes(needle) ||
      (s.headline || "").toLowerCase().includes(needle) ||
      (s.degree || "").toLowerCase().includes(needle) ||
      (s.skills || []).some((sk) => sk.toLowerCase().includes(needle))
    );
  }
  if (skillFilter) filtered = filtered.filter((s) => (s.skills || []).includes(skillFilter));
  if (langFilter)  filtered = filtered.filter((s) => (s.languages || []).includes(langFilter));

  return (
    <div>
      {/* Header band */}
      <div className="talent-hero">
        <div className="container">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Find Talent</div>
          <h1 style={{ color: "#FFFFFF", fontSize: "clamp(26px,3.5vw,38px)", marginBottom: "10px" }}>
            Verified university students, ready to work.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "15px", maxWidth: "520px", lineHeight: 1.6 }}>
            Every student on SkillBid is verified via their university email. Browse profiles, check skills and ratings, then post a task for them to apply to.
          </p>
        </div>
      </div>

      <div className="section-tight">
        <div className="container">
          {/* Filter bar */}
          <div className="talent-filter-bar">
            <input
              className="input"
              style={{ flex: "1 1 220px", maxWidth: "320px" }}
              placeholder="Search by name, skill, or degree…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="select" style={{ flex: "0 0 180px" }} value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
              <option value="">All skills</option>
              {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="select" style={{ flex: "0 0 160px" }} value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
              <option value="">All languages</option>
              {allLangs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            {(q || skillFilter || langFilter) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setQ(""); setSkillFilter(""); setLangFilter(""); }}>
                Clear filters
              </button>
            )}
          </div>

          <div className="talent-count">
            {loaded ? `${filtered.length} student${filtered.length !== 1 ? "s" : ""}` : "Loading…"}
            {(q || skillFilter || langFilter) && students.length !== filtered.length && (
              <span className="text-faint"> of {students.length} total</span>
            )}
          </div>

          {loaded && filtered.length === 0 && (
            <div className="empty-state">
              <h3>No students match those filters</h3>
              <p>Try a different search term or clear the filters.</p>
            </div>
          )}

          <div className="talent-grid">
            {filtered.map((s) => (
              <div key={s.id} className="talent-card" onClick={() => router.push(`/students/${s.id}`)}>
                <div className="talent-card-head">
                  {s.avatarUrl
                    ? <img src={s.avatarUrl} alt={s.fullName} className="talent-avatar" />
                    : <div className="avatar talent-avatar-fallback">{initials(s.fullName)}</div>
                  }
                  <div style={{ minWidth: 0 }}>
                    <div className="talent-name">{s.fullName}</div>
                    {s.headline && <div className="talent-headline">{s.headline}</div>}
                    {s.degree && <div className="talent-degree">{s.degree}</div>}
                    <div className="text-faint text-sm" style={{ marginTop: "2px" }}>{s.university}</div>
                  </div>
                </div>

                {s.rating || s.completedTasksCount > 0 ? (
                  <div className="talent-rating-row mt-14">
                    <StarRow score={s.rating} />
                    <span className="text-faint text-sm">{s.completedTasksCount} task{s.completedTasksCount !== 1 ? "s" : ""} done</span>
                  </div>
                ) : (
                  <div className="talent-new-badge mt-14">New on SkillBid</div>
                )}

                {(s.skills || []).length > 0 && (
                  <div className="talent-tags mt-14">
                    {(s.skills || []).slice(0, 4).map((sk) => <span key={sk} className="talent-tag">{sk}</span>)}
                    {(s.skills || []).length > 4 && <span className="talent-tag-more">+{(s.skills || []).length - 4}</span>}
                  </div>
                )}

                {(s.languages || []).length > 0 && (
                  <div className="talent-langs mt-10">
                    {(s.languages || []).map((l) => <span key={l} className="lang-chip">{l}</span>)}
                  </div>
                )}

                <div className="flex-between mt-14">
                  <span className={`talent-verify-line ${s.verified ? "talent-verify-ok" : "talent-verify-pending"}`}>
                    {s.verified ? "✓ University verified" : "Verification pending"}
                  </span>
                  <span className="talent-view-btn">View profile →</span>
                </div>
              </div>
            ))}
          </div>

          {!user && loaded && students.length > 0 && (
            <div className="talent-cta-band">
              <div>
                <div style={{ fontWeight: 700, fontSize: "17px", marginBottom: "6px" }}>Want to work with one of them?</div>
                <div className="text-soft text-sm">Post a task and let verified students apply. 15% commission on completion, nothing upfront.</div>
              </div>
              <button className="btn btn-stamp" onClick={() => router.push("/signup/company")}>Post your first task →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
