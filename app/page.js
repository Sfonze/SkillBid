import Link from "next/link";
import { db } from "@/lib/db";
import { TicketCard, Badge } from "@/components/ui";
import DemoVideoFrame from "@/components/DemoVideoFrame";
import { GraduationIcon, ShieldCheckIcon, CompassIcon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const [openTasksRow] = await db`SELECT COUNT(*) AS c FROM tasks WHERE status = 'OPEN'`;
  const [verifiedStudentsRow] = await db`SELECT COUNT(*) AS c FROM student_profiles WHERE verified = true`;
  const [smeCountRow] = await db`SELECT COUNT(*) AS c FROM sme_profiles`;
  const openTasks = Number(openTasksRow.c);
  const verifiedStudents = Number(verifiedStudentsRow.c);
  const smeCount = Number(smeCountRow.c);

  const [demoTaskRow] = await db`
    SELECT t.*, p.company_name FROM tasks t JOIN sme_profiles p ON p.user_id = t.sme_id
    WHERE t.status = 'OPEN' ORDER BY t.posted_at DESC LIMIT 1
  `;
  const demoTask = demoTaskRow
    ? {
        id: demoTaskRow.id,
        title: demoTaskRow.title,
        description: demoTaskRow.description,
        industry: demoTaskRow.industry,
        language: demoTaskRow.language,
        deliverableType: demoTaskRow.deliverable_type,
        dueDate: demoTaskRow.due_date,
        remuneration: Number(demoTaskRow.remuneration),
        postedAt: demoTaskRow.posted_at,
        status: demoTaskRow.status,
      }
    : null;

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: "14px" }}>STUDENT-FOUNDED · MAASTRICHT</div>
            <h1>Real tasks.<br />Real deadlines.<br />Real students.</h1>
            <p className="hero-sub">SkillBid lets companies hand off short-term work — research, design, translation, analysis — to verified university students, with milestones, contracts and payment handled for you.</p>
            <div className="hero-cta">
              <Link className="btn btn-stamp" href="/signup/company">Post a task</Link>
              <Link className="btn btn-ghost" href="/tasks">Browse open tasks →</Link>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-num">{openTasks}</div><div className="hero-stat-label">Open tasks now</div></div>
              <div><div className="hero-stat-num">{verifiedStudents}+</div><div className="hero-stat-label">Verified students</div></div>
              <div><div className="hero-stat-num">{smeCount}+</div><div className="hero-stat-label">Companies onboard</div></div>
            </div>
          </div>
          <div className="hero-ticket-wrap">
            {demoTask && (
              <div className="hero-ticket">
                <Link href={`/tasks/${demoTask.id}`} style={{ display: "block" }}>
                  <TicketCard task={demoTask} sme={demoTaskRow.company_name} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container"><div className="divider"></div></div>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2>One platform, two very different days.</h2>
            <p className="section-sub">Companies get vetted talent without a hiring process. Students get real client work without leaving university — fully employed for the assignment, through Adecco.</p>
          </div>
          <div className="howitworks-grid">
            <div>
              <div className="how-col-head"><Badge tone="stamp">For companies</Badge></div>
              <div className="how-step"><div className="how-step-num">01</div><div><div className="how-step-title">Post the task</div><div className="how-step-desc">Describe the deliverable, set a due date, language and budget. Break it into milestones if it's a bigger piece of work.</div></div></div>
              <div className="how-step"><div className="how-step-num">02</div><div><div className="how-step-title">Review applicants</div><div className="how-step-desc">See verified students who applied — university, rating, past tasks completed — and pick who gets the work.</div></div></div>
              <div className="how-step"><div className="how-step-num">03</div><div><div className="how-step-title">Sign once</div><div className="how-step-desc">Adecco becomes the student's employer of record for the assignment. You just approve the contract terms.</div></div></div>
              <div className="how-step"><div className="how-step-num">04</div><div><div className="how-step-title">Review & pay per milestone</div><div className="how-step-desc">Approve each deliverable as it lands. SkillBid takes a 15% platform fee on completed tasks — no separate invoice to chase.</div></div></div>
            </div>
            <div>
              <div className="how-col-head"><Badge tone="sage">For students</Badge></div>
              <div className="how-step"><div className="how-step-num">01</div><div><div className="how-step-title">Verify your university</div><div className="how-step-desc">Sign up with your university email and we confirm you're currently enrolled.</div></div></div>
              <div className="how-step"><div className="how-step-num">02</div><div><div className="how-step-title">Apply to tasks</div><div className="how-step-desc">Browse open tasks by industry, language or deadline, and apply with a short note. Track every application in your basket.</div></div></div>
              <div className="how-step"><div className="how-step-num">03</div><div><div className="how-step-title">Get hired properly</div><div className="how-step-desc">If you're picked, Adecco employs you for the task — so you're paid and insured like any other short-term job.</div></div></div>
              <div className="how-step"><div className="how-step-num">04</div><div><div className="how-step-title">Deliver milestone by milestone</div><div className="how-step-desc">Submit work against each milestone, message the company directly, and get paid as each one is approved.</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container" style={{ maxWidth: "880px" }}>
          <div className="section-head" style={{ textAlign: "center", margin: "0 auto 32px" }}>
            <div className="eyebrow">See it in action</div>
            <h2>2 minutes, the whole flow.</h2>
          </div>
          <DemoVideoFrame large />
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="trust-strip">
            <div className="trust-card">
              <div className="trust-icon"><GraduationIcon /></div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>University-verified, always</h3>
              <p className="text-soft text-sm">Every student account is checked against a list of recognised university email domains before they can apply to tasks.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon"><ShieldCheckIcon /></div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Properly employed, not freelance</h3>
              <p className="text-soft text-sm">Adecco acts as Employer of Record for every assignment, so students are paid through real payroll, not an invoice in the dark.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon"><CompassIcon /></div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Milestones, not guesswork</h3>
              <p className="text-soft text-sm">Every task is broken into milestones with their own due dates, so both sides know exactly what's expected and when.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="maastricht-band">
            <div>
              <div className="eyebrow" style={{ color: "rgba(248,248,242,0.6)", marginBottom: "10px" }}>OUR STORY</div>
              <h2>Started by students, two streets from Maastricht University.</h2>
              <p>We kept seeing the same gap: companies with small, well-defined tasks and no time to hire for them, and students next door with the exact skills to do them. SkillBid is the bridge — built by students who were on both sides of that gap.</p>
            </div>
            <Link className="btn btn-stamp" href="/about">Read our story →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
