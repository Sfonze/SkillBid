"use client";
import { money } from "@/lib/validators";
import { dueLabel, ageLabel } from "@/lib/format";

export function Badge({ tone = "ink", children }) {
  return (
    <span className={"badge badge-" + tone}>
      <span className="badge-dot"></span>
      {children}
    </span>
  );
}

export function VerifiedBadge({ verified, type }) {
  return verified ? <Badge tone="sage">{type === "uni" ? "University verified" : "VAT verified"}</Badge> : <Badge tone="clay">Verification pending</Badge>;
}

export function StarRow({ score }) {
  if (score == null) return <span className="text-faint text-sm">No ratings yet</span>;
  const full = Math.round(score);
  return (
    <span className="stars">
      {"★".repeat(full)}
      {"☆".repeat(5 - full)} <span className="text-soft text-sm mono">{Number(score).toFixed(1)}</span>
    </span>
  );
}

export function taskStatusBadge(task) {
  if (task.status === "COMPLETED") return <Badge tone="sage">Completed</Badge>;
  if (task.status === "IN_PROGRESS") return <Badge tone="stamp">In progress</Badge>;
  return <Badge tone="ink">Open</Badge>;
}

const STAGES = ["Open", "Applications", "Contract", "In progress", "Completed"];
export function taskStageIndex(task, contractStatus) {
  if (task.status === "COMPLETED") return 4;
  if (task.status === "IN_PROGRESS") {
    if (contractStatus === "SIGNED") return 3;
    return 2;
  }
  if (task.hasApplications) return 1;
  return 0;
}
export function Pipeline({ task, contractStatus }) {
  const idx = taskStageIndex(task, contractStatus);
  return (
    <div className="pipeline">
      {STAGES.map((s, i) => (
        <div key={s} className={"pipeline-step" + (i < idx ? " done" : i === idx ? " current" : "")}>
          <span className="pipeline-dot"></span>
          {s}
        </div>
      ))}
    </div>
  );
}

export function TicketCard({ task, sme, children, onClick }) {
  return (
    <div className="ticket" onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      <div className="ticket-body">
        <div className="flex-between" style={{ marginBottom: "10px" }}>
          <div className="eyebrow">{task.industry} · {task.deliverableType}</div>
          {taskStatusBadge(task)}
        </div>
        <h3 className="ticket-title">{task.title}</h3>
        {sme && <div className="text-sm text-faint" style={{ marginBottom: "8px" }}>{sme}</div>}
        <p className="ticket-desc">{task.description}</p>
        <div className="ticket-meta">
          <span className="ticket-meta-item">🗣️ {task.language}</span>
          <span className="ticket-meta-item">📅 {dueLabel(task.dueDate)}</span>
          <span className="ticket-meta-item">⏱ {ageLabel(task.postedAt)}</span>
        </div>
        {children}
      </div>
      <div className="ticket-seam">
        <span className="ticket-notch top"></span>
        <span className="ticket-notch bottom"></span>
      </div>
      <div className="ticket-stub">
        <div>
          <div className="ticket-stub-label">Reward</div>
          <div className="ticket-stub-main">{money(task.remuneration)}</div>
        </div>
        <div className="ticket-id">{task.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ position: "relative" }}>
        <button className="modal-close btn-text" onClick={onClose} aria-label="Close">✕</button>
        {title && <h3 style={{ fontSize: "20px", marginBottom: "18px", paddingRight: "24px" }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
