"use client";
import { useState } from "react";
import { Modal } from "./ui";

export default function RatingPrompt({ onSubmit, onSkip }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <Modal title="Rate how this task went" onClose={onSkip}>
      <div className="flex-gap" style={{ fontSize: "26px", marginBottom: "14px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ cursor: "pointer", color: n <= score ? "var(--stamp)" : "var(--line)" }} onClick={() => setScore(n)}>★</span>
        ))}
      </div>
      <textarea className="textarea" placeholder="A short comment helps the other side build trust on the platform." value={comment} onChange={(e) => setComment(e.target.value)} />
      <button className="btn btn-stamp btn-block mt-16" onClick={() => onSubmit(score, comment)}>Submit rating</button>
    </Modal>
  );
}
