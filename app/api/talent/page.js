"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VerifiedBadge, StarRow } from "@/components/ui";
import { initials } from "@/lib/format";

export default function Talent() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  useEffect(() => {
    fetch("/api/talent").then((r) => r.json()).then((d) => { setStudents(d.students || []); setLoaded(true); });
  }, []);

  const allSkills = Array.from(new Set(students.flatMap((s) => s.skills))).sort();

  let filtered = students;
  if (q.trim()) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((s) =>
      s.fullName.toLowerCase().includes(needle) ||
      (s.headline || "").toLowerCase().includes(needle) ||
      s.skills.some((sk) => sk.toLowerCase().includes(needle))
    );
  }
  if (skillFilter) filtered = filtered.filter((s) => s.skills.includes(skillFilter));

  return (
    <div className="section-tight">
      <div className="container">
        <div className="section-head" style={{ marginBottom: "28px" }}>
          <div className="eyebrow">Browse Talent</div>
          <h2>{loaded ? `${filtered.length} verified student${filtered.length !== 1 ? "s" : ""}` : "Loading…"}</h2>
          <p className="section-sub">Search the students active on SkillBid by name, headline, or skill.</p>
        </div>

        <div className="filter-bar">
          <input className="input" style={{ maxWidth: "280px" }} placeholder="Search by name or skill…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" style={{ maxWidth: "220px" }} value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
            <option value="">All skills</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loaded && filtered.length === 0 && <div className="empty-state"><h3>No students match those filters</h3></div>}

        <div className="talent-grid">
          {filtered.map((s) => (
            <div key={s.id} className="talent-card" onClick={() => router.push(`/students/${s.id}`)}>
              <div className="talent-card-head">
                {s.avatarUrl ? <img src={s.avatarUrl} alt={s.fullName} className="talent-avatar" /> : <div className="avatar talent-avatar-fallback">{initials(s.fullName)}</div>}
                <div>
                  <div className="talent-name">{s.fullName}</div>
                  <div className="talent-headline">{s.headline || s.university}</div>
                  <div className="text-faint text-sm">{s.university}</div>
                </div>
              </div>
              <div className="mt-16"><StarRow score={s.rating} /> <span className="text-faint text-sm">· {s.completedTasksCount} tasks done</span></div>
              <div className="talent-tags mt-16">
                {s.skills.slice(0, 4).map((sk) => <span key={sk} className="talent-tag">{sk}</span>)}
              </div>
              <div className="text-faint text-sm mt-16">{s.languages.join(" · ")}</div>
              <div className="flex-between mt-16">
                <VerifiedBadge verified={s.verified} type="uni" />
                <span className="btn btn-ghost btn-sm">View profile →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
