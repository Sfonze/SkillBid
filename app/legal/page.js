import Link from "next/link";

export default function Legal({ searchParams }) {
  const tab = searchParams?.tab || "terms";

  return (
    <div className="section">
      <div className="container legal-body">
        <div className="eyebrow">Legal</div>
        <h1 style={{ fontSize: "32px", marginTop: "8px", marginBottom: "24px" }}>Terms, privacy & cookies</h1>
        <div className="legal-notice">This is placeholder template text for the working prototype, written to reflect a Netherlands / Maastricht launch and GDPR basics. It is not legal advice and should be reviewed and finalised by qualified Dutch legal counsel before SkillBid goes live.</div>
        <div className="tabs" style={{ marginBottom: "30px" }}>
          <Link href="/legal?tab=terms" className={"tab" + (tab === "terms" ? " active" : "")} style={{ display: "inline-block", textDecoration: "none" }}>Terms of service</Link>
          <Link href="/legal?tab=privacy" className={"tab" + (tab === "privacy" ? " active" : "")} style={{ display: "inline-block", textDecoration: "none" }}>Privacy policy</Link>
          <Link href="/legal?tab=cookies" className={"tab" + (tab === "cookies" ? " active" : "")} style={{ display: "inline-block", textDecoration: "none" }}>Cookie policy</Link>
        </div>

        {tab === "terms" && (
          <div>
            <p>These Terms of Service govern use of the SkillBid platform, operated by SkillBid B.V., registered in Maastricht, the Netherlands. By creating an account, you agree to these terms.</p>
            <h3>1. What SkillBid is</h3>
            <p>SkillBid is a marketplace that connects companies (&quot;SMEs&quot;) with short-term tasks to verified university students. SkillBid facilitates the matching, contracting and milestone tracking of each task; SkillBid is not itself the employer of any student.</p>
            <h3>2. Employment arrangement</h3>
            <p>Where a student is allocated to a task, the student is employed for the duration of that assignment by Adecco, acting as Employer of Record, under a separate employment contract between the student and Adecco. SkillBid and the SME are not the student&apos;s employer.</p>
            <h3>3. SME obligations</h3>
            <p>SMEs must provide accurate company information at sign-up, including legal name, VAT number and core business activity, and must describe each task&apos;s deliverable, due date, language and remuneration clearly and in good faith.</p>
            <h3>4. Student obligations</h3>
            <p>Students must be enrolled at a recognised university at the time of application and must provide accurate information at sign-up. Misrepresenting enrollment status may result in account suspension.</p>
            <h3>5. Fees</h3>
            <p>SkillBid charges a platform commission of 15% of the agreed remuneration on each completed task, deducted before payment is released to the student via Adecco&apos;s payroll. There are no fees to browse, apply, or post a task.</p>
            <h3>6. Milestones & approval</h3>
            <p>Tasks are divided into milestones with individual due dates. Deliverables submitted against a milestone must be reviewed by the SME within a reasonable time; if a deliverable does not meet the agreed brief, the SME may request changes before approving.</p>
            <h3>7. Disputes</h3>
            <p>Either party may flag an issue with a task through the platform. SkillBid will attempt to mediate in good faith; this does not affect either party&apos;s statutory rights under Dutch law.</p>
            <h3>8. Governing law</h3>
            <p>These terms are governed by the laws of the Netherlands, and disputes fall under the jurisdiction of the competent court in Maastricht / Limburg.</p>
          </div>
        )}

        {tab === "privacy" && (
          <div>
            <p>SkillBid B.V. (&quot;we&quot;, &quot;us&quot;) respects your privacy and processes personal data in line with the EU General Data Protection Regulation (GDPR) and Dutch implementing legislation.</p>
            <h3>1. What we collect</h3>
            <p>For students: full name, university email, university, languages, skills, and (when allocated to a task) the additional details required by Adecco for employment, such as address, IBAN and tax identification. For SMEs: company name, founding date, VAT number, core business, and contact details.</p>
            <h3>2. Why we collect it</h3>
            <p>To verify university enrollment and company registration, to match students with relevant tasks, to enable contracting through Adecco, and to operate milestone tracking, messaging and notifications within the platform.</p>
            <h3>3. Who we share it with</h3>
            <p>Adecco receives the personal data necessary to act as Employer of Record for an allocated task. SMEs see the profile information of students who apply to their tasks. We do not sell personal data to third parties.</p>
            <h3>4. Where it&apos;s stored</h3>
            <p>Data is stored and processed within the EU. We retain task and contract records for as long as required under Dutch tax and labour law record-keeping obligations.</p>
            <h3>5. Your rights</h3>
            <p>Under the GDPR you can request access to, correction of, or deletion of your personal data, and can object to certain processing. Requests can be sent to privacy@skillbid.nl.</p>
            <h3>6. Contact</h3>
            <p>SkillBid B.V., Maastricht, the Netherlands. Data protection queries: privacy@skillbid.nl.</p>
          </div>
        )}

        {tab === "cookies" && (
          <div>
            <p>SkillBid uses a limited number of cookies to operate the platform and, optionally, to understand how it&apos;s used.</p>
            <h3>1. Essential cookies</h3>
            <p>Used to keep you logged in and remember your session. These cannot be switched off, as the platform cannot function without them.</p>
            <h3>2. Analytics cookies (optional)</h3>
            <p>Help us understand which pages are used and where people get stuck, so we can improve the product. These are only set if you accept them in the cookie banner.</p>
            <h3>3. Managing cookies</h3>
            <p>You can change your cookie choice at any time from the link in the footer, or by clearing cookies in your browser settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
