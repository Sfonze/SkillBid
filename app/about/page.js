import Link from "next/link";

export default function About() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: "820px" }}>
        <div className="eyebrow">About SkillBid</div>
        <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: "10px", lineHeight: 1.1 }}>A student company, built where the problem actually was.</h1>
        <p className="section-sub" style={{ maxWidth: "680px" }}>
          SkillBid started in Maastricht, founded by students who noticed the same thing from two different sides of the table: small and medium businesses kept needing short, well-defined pieces of work done — research, a deck, a translation, a first website draft — and didn't have the time or budget to hire for it. Meanwhile, the city was full of capable students who wanted real client work, not just another internship application.
        </p>

        <div className="about-photo-strip">
          <div className="founder-card" style={{ background: "var(--ink)", color: "var(--paper)" }}>
            <div className="eyebrow" style={{ color: "rgba(248,248,242,0.55)" }}>Where we started</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", marginTop: "8px" }}>A shared desk at the Maastricht University library</div>
          </div>
          <div className="founder-card" style={{ background: "var(--stamp)", color: "white" }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>First task</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", marginTop: "8px" }}>A market scan for a local logistics company, completed in 9 days</div>
          </div>
          <div className="founder-card" style={{ background: "var(--sage)", color: "white" }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>Today</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", marginTop: "8px" }}>Built end-to-end with Adecco as employer of record for every task</div>
          </div>
        </div>

        <h3 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "14px" }}>Why we exist</h3>
        <p className="text-soft" style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Most freelance platforms treat students like independent contractors and leave the employment question to them. We didn't think that was good enough. Every task on SkillBid is a real, short-term employment assignment — Adecco is the legal employer of the student for its duration, which means proper payroll, the right insurance, and no grey area for anyone.
        </p>
        <p className="text-soft" style={{ lineHeight: 1.7 }}>
          We also didn't want this to be an anonymous gig marketplace. Students sign up with a university email and get verified before they can apply to anything. Companies provide their registration details up front. The result is smaller, more accountable, and — we think — a lot more trustworthy than the alternative.
        </p>

        <h3 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "14px" }}>How we make money</h3>
        <p className="text-soft" style={{ lineHeight: 1.7 }}>
          SkillBid takes a 15% commission on the remuneration of each completed task — nothing upfront, no subscription, no fee to apply. We only get paid once a company gets their deliverable and a student gets paid.
        </p>

        <div className="flex-gap mt-32">
          <Link className="btn btn-stamp" href="/signup/company">Post your first task</Link>
          <Link className="btn btn-ghost" href="/signup/student">Join as a student</Link>
        </div>
      </div>
    </div>
  );
}
