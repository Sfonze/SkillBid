"use client";
import { useState } from "react";
import { Badge } from "./ui";
import { fmtDate, dueLabel } from "@/lib/format";

const MILESTONE_LABEL = { PENDING: "Not started", SUBMITTED: "Submitted, awaiting review", APPROVED: "Approved", CHANGES_REQUESTED: "Changes requested" };
const MILESTONE_TONE = { PENDING: "ink", SUBMITTED: "stamp", APPROVED: "sage", CHANGES_REQUESTED: "clay" };

export default function MilestoneRow({ milestone, index, isSme, isStudent, onSubmit, onApprove, onRequestChanges }) {
  const [draft, setDraft] = useState("");
  const [showChangeBox, setShowChangeBox] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const markerClass = milestone.status === "APPROVED" ? "approved" : milestone.status === "SUBMITTED" ? "submitted" : milestone.status === "CHANGES_REQUESTED" ? "changes" : "";

  return (
    <div className="milestone">
      <div className={"milestone-marker " + markerClass}>{milestone.status === "APPROVED" ? "✓" : index + 1}</div>
      <div className="milestone-body">
        <div className="flex-between" style={{ flexWrap: "wrap", gap: "8px" }}>
          <div className="how-step-title">{milestone.title}</div>
          <Badge tone={MILESTONE_TONE[milestone.status]}>{MILESTONE_LABEL[milestone.status]}</Badge>
        </div>
        <div className="text-faint text-sm mt-8">{fmtDate(milestone.dueDate)} · {dueLabel(milestone.dueDate)}</div>

        {milestone.note && (
          <div className="deliverable-box">
            <div className="text-faint text-sm" style={{ marginBottom: "4px" }}>{milestone.status === "CHANGES_REQUESTED" ? "Feedback from company" : "Deliverable note"}</div>
            {milestone.note}
          </div>
        )}

        {isStudent && (milestone.status === "PENDING" || milestone.status === "CHANGES_REQUESTED") && (
          <div className="mt-16">
            <textarea className="textarea" placeholder="Describe what you're submitting (link, summary, file name)…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn btn-stamp btn-sm mt-8" disabled={!draft.trim()} onClick={() => { onSubmit(milestone.id, draft); setDraft(""); }}>
              {milestone.status === "CHANGES_REQUESTED" ? "Resubmit deliverable" : "Submit deliverable"}
            </button>
          </div>
        )}

        {isSme && milestone.status === "SUBMITTED" && (
          <div className="flex-gap mt-16">
            <button className="btn btn-sage btn-sm" onClick={() => onApprove(milestone.id)}>Approve milestone</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowChangeBox((s) => !s)}>Request changes</button>
          </div>
        )}
        {showChangeBox && (
          <div className="mt-8">
            <textarea className="textarea" placeholder="What needs to change?" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />
            <button className="btn btn-clay btn-sm mt-8" disabled={!changeNote.trim()} onClick={() => { onRequestChanges(milestone.id, changeNote); setChangeNote(""); setShowChangeBox(false); }}>Send feedback</button>
          </div>
        )}
      </div>
    </div>
  );
}
