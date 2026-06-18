import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div>
      <section className="about-banner">
        <div className="container">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>About SkillBid</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: "10px", lineHeight: 1.15, color: "#FFFFFF", maxWidth: "640px" }}>
            Built from a gap we struggled with ourselves.
          </h1>
        </div>
      </section>

      <div className="section">
        <div className="container" style={{ maxWidth: "820px" }}>
        <p className="section-sub" style={{ maxWidth: "700px" }}>
          We spent our own internship searches frustrated by how few genuinely insightful opportunities were out there, and the more SMEs we spoke to, the clearer it became that the problem ran both ways: small and medium businesses simply don&apos;t have the same access to skilled, motivated talent that large companies do. SkillBid is the solution we built to close that gap, and to turn it into real value for both sides, and for the wider local economy.
        </p>
        <p className="text-soft" style={{ lineHeight: 1.7, marginTop: "16px" }}>
          SkillBid is a student company founded in 2026 in Maastricht by two business students, Sacha Fonzé and Oscar Solé. We wanted to create an insightful, valuable relationship between SMEs and high-end universities, connecting local businesses with the cultural diversity found among top international students, so that knowledge moves both ways.
        </p>

        <div className="vision-mission-grid">
          <div className="vision-mission-card">
            <div className="eyebrow" style={{ marginBottom: "10px" }}>Vision</div>
            <p>To become the leading European platform connecting SMEs with university student talent for short-term, high-impact tasks.</p>
          </div>
          <div className="vision-mission-card">
            <div className="eyebrow" style={{ marginBottom: "10px" }}>Mission</div>
            <p>To make verified university talent accessible to every SME, while giving students a portfolio-first path to professional experience.</p>
          </div>
        </div>
        </div>
      </div>

      <div className="about-founders-band">
        <div className="container" style={{ maxWidth: "820px" }}>
          <h3 style={{ fontSize: "22px", marginBottom: "24px" }}>Founders</h3>
          <div className="founders-grid">
            <div className="founder-profile">
              <div className="founder-photo-wrap">
                <Image src="/founder-sacha.jpg" alt="Sacha Fonzé" width={160} height={160} className="founder-photo" />
              </div>
              <div className="founder-name">Sacha Fonzé</div>
              <div className="founder-role">Co-founder</div>
              <p className="founder-blurb">Spent one too many internship seasons wishing a platform like this existed, so we built it.</p>
            </div>
            <div className="founder-profile">
              <div className="founder-photo-wrap">
                <Image src="/founder-oscar.jpg" alt="Oscar Solé" width={160} height={160} className="founder-photo" />
              </div>
              <div className="founder-name">Oscar Solé</div>
              <div className="founder-role">Co-founder</div>
              <p className="founder-blurb">Believes the smartest companies aren&apos;t always the biggest ones, and wants SkillBid to prove it.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: "820px" }}>
        <h3 style={{ fontSize: "22px", marginBottom: "14px" }}>Why we exist</h3>
        <p className="text-soft" style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Most freelance platforms treat students like independent contractors and leave the employment question to them. We didn&apos;t think that was good enough. Every task on SkillBid is a real, short-term employment assignment, Adecco is the legal employer of the student for its duration, which means proper payroll, the right insurance, and no grey area for anyone.
        </p>
        <p className="text-soft" style={{ lineHeight: 1.7 }}>
          We also didn&apos;t want this to be an anonymous gig marketplace. Students sign up with a university email and get verified before they can apply to anything. Companies provide their registration details up front. The result is smaller, more accountable, and, we think, a lot more trustworthy than the alternative.
        </p>

        <h3 style={{ fontSize: "22px", marginTop: "40px", marginBottom: "14px" }}>How we make money</h3>
        <p className="text-soft" style={{ lineHeight: 1.7 }}>
          SkillBid takes a 15% commission on the remuneration of each completed task, nothing upfront, no subscription, no fee to apply. We only get paid once a company gets their deliverable and a student gets paid.
        </p>

        <div className="flex-gap mt-32">
          <Link className="btn btn-stamp" href="/signup/company">Post your first task</Link>
          <Link className="btn btn-ghost" href="/signup/student">Join as a student</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
