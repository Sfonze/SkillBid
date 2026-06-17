"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { TicketCard, Badge } from "@/components/ui";
import { INDUSTRIES, LANGUAGES, DELIVERABLE_TYPES } from "@/lib/validators";

export default function BrowseTasks() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [industry, setIndustry] = useState("");
  const [language, setLanguage] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/tasks?status=open")
      .then((r) => r.json())
      .then((data) => { setTasks(data.tasks || []); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetch("/api/applications?mine=1").then((r) => r.json()).then((data) => setMyApplications(data.applications || []));
    } else {
      setMyApplications([]);
    }
  }, [user]);

  const appliedTaskIds = new Set(myApplications.map((a) => a.taskId));

  let filtered = tasks;
  if (industry) filtered = filtered.filter((t) => t.industry === industry);
  if (language) filtered = filtered.filter((t) => t.language === language);
  if (deliverable) filtered = filtered.filter((t) => t.deliverableType === deliverable);
  if (q.trim()) filtered = filtered.filter((t) => (t.title + " " + t.description).toLowerCase().includes(q.toLowerCase()));
  filtered = [...filtered];
  if (sort === "newest") filtered.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  if (sort === "due") filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  if (sort === "pay") filtered.sort((a, b) => b.remuneration - a.remuneration);

  return (
    <div className="section-tight">
      <div className="container">
        <div className="section-head" style={{ marginBottom: "28px" }}>
          <div className="eyebrow">Open tasks</div>
          <h2>{loaded ? `${filtered.length} task${filtered.length !== 1 ? "s" : ""} ready to apply to` : "Loading tasks…"}</h2>
        </div>
        <div className="filter-bar">
          <input className="input" style={{ maxWidth: "240px" }} placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" style={{ maxWidth: "190px" }} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="select" style={{ maxWidth: "160px" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All languages</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="select" style={{ maxWidth: "220px" }} value={deliverable} onChange={(e) => setDeliverable(e.target.value)}>
            <option value="">All deliverable types</option>
            {DELIVERABLE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="select" style={{ maxWidth: "170px" }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="due">Due soonest</option>
            <option value="pay">Highest pay</option>
          </select>
        </div>

        {loaded && filtered.length === 0 && (
          <div className="empty-state"><h3>No tasks match those filters</h3><p>Try clearing a filter, or check back soon — new tasks are posted regularly.</p></div>
        )}

        <div className="list-stack">
          {filtered.map((t) => (
            <TicketCard key={t.id} task={t} sme={t.smeCompanyName} onClick={() => router.push(`/tasks/${t.id}`)}>
              {appliedTaskIds.has(t.id) && <div className="mt-16"><Badge tone="stamp">You&apos;ve applied</Badge></div>}
            </TicketCard>
          ))}
        </div>
      </div>
    </div>
  );
}
