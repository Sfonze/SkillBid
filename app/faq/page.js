"use client";
import { useState } from "react";

const STUDENT_FAQS = [
  {
    q: "How do I get started as a student?",
    a: "Sign up with your university email. If your university domain is recognised, your account is verified instantly. From there, browse open tasks and apply to the ones that match your skills with a short note about why you're a good fit.",
  },
  {
    q: "How and when do I get paid?",
    a: "Once you're selected for a task, Adecco becomes your employer for the length of the assignment, following the standard duration and terms of a regular freelance contract. Payment is released through Adecco's payroll once each milestone is approved by the company.",
  },
  {
    q: "What kind of tasks can I find on SkillBid?",
    a: "Short, well-defined projects across industries like marketing, design, software, market research, finance, and translation, typically ranging from a few days to a few weeks of work.",
  },
  {
    q: "Is SkillBid available in my city?",
    a: "SkillBid is currently only available in Maastricht. If you'd like to help us bring it to your city, send us your interest, we're always looking to grow the network.",
  },
];

const BUSINESS_FAQS = [
  {
    q: "How do I post a task?",
    a: "Sign up as a company, describe the deliverable clearly, set a due date and remuneration, and break the work into milestones. Once published, verified students can start applying right away.",
  },
  {
    q: "What is the commission fee?",
    a: "SkillBid charges a fixed 15% commission on the agreed remuneration of each completed task. There are no fees to post a task or browse applicants.",
  },
  {
    q: "How are student profiles verified?",
    a: "Students sign up using their official university email address, which we check against recognised university domains to confirm they're currently enrolled.",
  },
  {
    q: "What if I am not satisfied with the result?",
    a: "Payment is only released once you confirm the task is completed to your satisfaction. If there is a dispute, our support team will step in to help resolve it fairly for both parties.",
  },
];

function FaqColumn({ title, items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="faq-column">
      <div className="eyebrow" style={{ marginBottom: "16px" }}>{title}</div>
      <div className="faq-list">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="faq-item">
              <button className="faq-question" onClick={() => setOpenIndex(open ? null : i)}>
                <span>{item.q}</span>
                <span className={"faq-chevron" + (open ? " open" : "")}>⌄</span>
              </button>
              {open && <div className="faq-answer">{item.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-head" style={{ margin: "0 auto 44px", textAlign: "center", maxWidth: "640px" }}>
          <div className="eyebrow">FAQ</div>
          <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", marginTop: "10px" }}>Common questions</h1>
        </div>
        <div className="faq-grid">
          <FaqColumn title="FOR STUDENTS" items={STUDENT_FAQS} />
          <FaqColumn title="FOR BUSINESSES" items={BUSINESS_FAQS} />
        </div>
        <div className="card card-pad" style={{ marginTop: "32px", textAlign: "center" }}>
          <p className="text-soft">Still have a question? <a href="/contact" style={{ textDecoration: "underline", fontWeight: 600 }}>Get in touch</a>.</p>
        </div>
      </div>
    </div>
  );
}
