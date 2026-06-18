// Run with: node db/seed.js
// Populates demo SMEs, students, tasks, applications, contracts, messages, notifications, ratings.
require("dotenv").config({ quiet: true });
const postgres = require("postgres");
const bcrypt = require("bcryptjs");

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : "require",
});

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function daysAgo(n) {
  return daysFromNow(-n);
}
function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await sql`TRUNCATE ratings, notifications, messages, contracts, applications, milestones, tasks, student_profiles, sme_profiles, users CASCADE`;

  const pw = await bcrypt.hash("demo1234", 10);

  console.log("Creating SMEs...");
  const [greenfields] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('hr@greenfieldslogistics.nl', ${pw}, 'SME') RETURNING id`;
  await sql`INSERT INTO sme_profiles (user_id, company_name, foundation_date, vat_number, core_business, tasks_completed_before, verified, bio, location, website, industry, company_size)
    VALUES (${greenfields.id}, 'Greenfields Logistics B.V.', '2014-03-01', 'NL123456789B01', 'Sustainable freight & last-mile logistics', 6, true, 'We run electric last-mile delivery fleets across the Benelux, and regularly bring in students for research, translation, and brand work alongside our small ops team.', 'Maastricht, Netherlands', 'https://greenfieldslogistics.nl', 'Logistics & Supply Chain', '6-15 employees')`;

  const [nova] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('team@novastudio.nl', ${pw}, 'SME') RETURNING id`;
  await sql`INSERT INTO sme_profiles (user_id, company_name, foundation_date, vat_number, core_business, tasks_completed_before, verified, bio, location, website, industry, company_size)
    VALUES (${nova.id}, 'Nova Studio', '2019-08-12', 'NL987654321B02', 'Brand & digital design agency', 2, true, 'A small design studio working with early-stage startups on brand identity, pitch decks, and first-version websites.', 'Maastricht, Netherlands', 'https://novastudio.nl', 'Design & Creative', '1-5 employees')`;

  const [vellum] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('contact@vellumlegal.eu', ${pw}, 'SME') RETURNING id`;
  await sql`INSERT INTO sme_profiles (user_id, company_name, foundation_date, vat_number, core_business, tasks_completed_before, verified, bio, location, website, industry, company_size)
    VALUES (${vellum.id}, 'Vellum Legal Partners', '2021-01-20', 'BE0123XYZ', 'Corporate legal advisory', 1, false, 'We help SMEs expanding into new EU markets navigate compliance and contracts.', 'Brussels, Belgium', null, 'Legal & Compliance', '1-5 employees')`;

  console.log("Creating students...");
  const [anna] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('anna.devries@student.maastrichtuniversity.nl', ${pw}, 'STUDENT') RETURNING id`;
  await sql`INSERT INTO student_profiles (user_id, full_name, university, university_email, languages, skills, completed_tasks_count, rating, verified, headline, bio, location, response_time, available_from, hours_per_week, skill_levels, degree)
    VALUES (${anna.id}, 'Anna de Vries', 'Maastricht University', 'anna.devries@student.maastrichtuniversity.nl', ${["English","Dutch"]}, ${["Market Research","Data Analysis","Excel"]}, 4, 4.8, true,
      'Marketing & Research Specialist', 'Second-year MSc International Business student with a strong background in marketing strategy, content creation, and market research. I have lived in Poland, Germany, and the Netherlands, so I can produce genuinely native-quality work, not just translations. I like tasks with a clear brief, a real deadline, and an SME that cares about the outcome.',
      'Maastricht, Netherlands', 'within a few hours', '2026-07-01', 20, ${JSON.stringify([{name:"Social media",level:92},{name:"Market research",level:90},{name:"Copywriting",level:88},{name:"Excel / Sheets",level:70}])}, 'MSc International Business')`;

  const [marco] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('m.tessier@ru.nl', ${pw}, 'STUDENT') RETURNING id`;
  await sql`INSERT INTO student_profiles (user_id, full_name, university, university_email, languages, skills, completed_tasks_count, rating, verified, headline, bio, location, response_time, available_from, hours_per_week, skill_levels, degree)
    VALUES (${marco.id}, 'Marco Tessier', 'Radboud University', 'm.tessier@ru.nl', ${["English","French"]}, ${["Branding","Graphic Design","Illustration"]}, 2, 4.5, true,
      'Brand & Visual Identity Designer', 'BSc Communication Design student focused on brand identity and illustration. Comfortable taking a brand from a rough idea to a finished, consistent visual system.',
      'Nijmegen, Netherlands', 'within a day', '2026-07-15', 15, ${JSON.stringify([{name:"Branding",level:85},{name:"Illustration",level:80},{name:"Graphic design",level:90}])}, 'BSc Communication Design')`;

  const [julia] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('julia.hoffmann@gmail.com', ${pw}, 'STUDENT') RETURNING id`;
  await sql`INSERT INTO student_profiles (user_id, full_name, university, university_email, languages, skills, completed_tasks_count, rating, verified, headline, bio, location, hours_per_week, skill_levels, degree)
    VALUES (${julia.id}, 'Julia Hoffmann', 'Maastricht University', 'julia.hoffmann@gmail.com', ${["English","German"]}, ${["Finance","Excel Modelling"]}, 0, null, false,
      'Finance Student', 'First-year finance student, new to SkillBid and keen to take on my first task.',
      'Maastricht, Netherlands', 10, ${JSON.stringify([{name:"Excel modelling",level:65},{name:"Financial analysis",level:60}])}, 'BSc Finance')`;

  const [sam] = await sql`INSERT INTO users (email, password_hash, role) VALUES ('s.okafor@student.maastrichtuniversity.nl', ${pw}, 'STUDENT') RETURNING id`;
  await sql`INSERT INTO student_profiles (user_id, full_name, university, university_email, languages, skills, completed_tasks_count, rating, verified, headline, bio, location, response_time, available_from, hours_per_week, skill_levels, degree)
    VALUES (${sam.id}, 'Sam Okafor', 'Maastricht University', 's.okafor@student.maastrichtuniversity.nl', ${["English"]}, ${["Software","Python","Web Development"]}, 6, 4.9, true,
      'Web Developer & Automation', 'BSc Data Science student who builds prototypes and small automations for SMEs. I have shipped 6 small projects through SkillBid so far, ranging from landing pages to internal tools.',
      'Maastricht, Netherlands', 'same day', '2026-06-20', 20, ${JSON.stringify([{name:"Web development",level:88},{name:"Python",level:85},{name:"No-code tools",level:75}])}, 'BSc Data Science')`;

  console.log("Creating tasks + milestones...");
  async function makeTask({ smeId, title, description, industry, language, deliverableType, dueDate, remuneration, postedAt, status, allocatedStudentId }, milestoneDefs) {
    const [task] = await sql`
      INSERT INTO tasks (sme_id, title, description, industry, language, deliverable_type, due_date, remuneration, posted_at, status, allocated_student_id)
      VALUES (${smeId}, ${title}, ${description}, ${industry}, ${language}, ${deliverableType}, ${dueDate}, ${remuneration}, ${postedAt}, ${status}, ${allocatedStudentId || null})
      RETURNING *
    `;
    for (let i = 0; i < milestoneDefs.length; i++) {
      const m = milestoneDefs[i];
      await sql`INSERT INTO milestones (task_id, position, title, due_date, status, note, submitted_at)
        VALUES (${task.id}, ${i}, ${m.title}, ${m.dueDate}, ${m.status || "PENDING"}, ${m.note || ""}, ${m.submittedAt || null})`;
    }
    return task;
  }

  const t1 = await makeTask({
    smeId: greenfields.id, title: "Market entry research for Benelux e-bike rental",
    description: "We are evaluating a launch of short-term e-bike rental stations across mid-size Benelux cities. We need a structured market scan: competitor pricing, regulatory constraints per country, and a recommendation on which 3 cities to pilot in first.",
    industry: "Logistics", language: "English", deliverableType: "Market research report", dueDate: daysFromNow(21), remuneration: 450, postedAt: daysAgo(2), status: "OPEN",
  }, [
    { title: "Desk research & competitor scan", dueDate: daysFromNow(10) },
    { title: "Draft report & city recommendation", dueDate: daysFromNow(18) },
  ]);

  const t2 = await makeTask({
    smeId: nova.id, title: "Refresh our investor pitch deck for Series A",
    description: "Our current deck is text-heavy and inconsistent. We need a visual refresh: cleaner structure, consistent grid, and a stronger narrative arc across 14 slides, keeping our existing brand colours.",
    industry: "Design & Creative", language: "English", deliverableType: "Pitch deck", dueDate: daysFromNow(14), remuneration: 300, postedAt: daysAgo(5), status: "OPEN",
  }, [
    { title: "Wireframe & slide structure", dueDate: daysFromNow(5) },
    { title: "Final designed deck", dueDate: daysFromNow(12) },
  ]);

  const t3 = await makeTask({
    smeId: greenfields.id, title: "Design new livery & social templates",
    description: "We are refreshing our van fleet livery and need matching social media templates (LinkedIn + Instagram) so our brand feels consistent on the road and online.",
    industry: "Design & Creative", language: "English", deliverableType: "Brand identity", dueDate: daysFromNow(20), remuneration: 500, postedAt: daysAgo(15), status: "IN_PROGRESS", allocatedStudentId: marco.id,
  }, [
    { title: "Concept directions (3 options)", dueDate: daysAgo(2), status: "APPROVED", note: "Three livery directions delivered as PDF moodboards, option B selected.", submittedAt: daysAgo(3) },
    { title: "Final assets & templates", dueDate: daysFromNow(10) },
  ]);

  const t4 = await makeTask({
    smeId: nova.id, title: "Build a 3-page marketing site prototype",
    description: "We want a clickable prototype (home, product, contact) to test with users before we brief a developer. Responsive layout, our brand fonts, no CMS needed yet.",
    industry: "Software & IT", language: "English", deliverableType: "Website / landing page", dueDate: daysFromNow(9), remuneration: 600, postedAt: daysAgo(20), status: "IN_PROGRESS", allocatedStudentId: sam.id,
  }, [
    { title: "Wireframes", dueDate: daysAgo(10), status: "APPROVED", note: "Low-fi wireframes for all 3 pages, approved as-is.", submittedAt: daysAgo(11) },
    { title: "Build & responsive QA", dueDate: daysAgo(2), status: "SUBMITTED", note: "Prototype link: skillbid-demo.example/proto-v1, tested on mobile and desktop widths.", submittedAt: daysAgo(2) },
    { title: "Final handoff & assets", dueDate: daysFromNow(7) },
  ]);

  const t5 = await makeTask({
    smeId: vellum.id, title: "GDPR compliance checklist for EU clients",
    description: "We advise SMEs entering EU markets and want a plain-language GDPR checklist we can hand to clients, covering data processing basics, DPA requirements and breach notification timelines.",
    industry: "Legal", language: "English", deliverableType: "Survey & insights report", dueDate: daysAgo(3), remuneration: 350, postedAt: daysAgo(40), status: "COMPLETED", allocatedStudentId: anna.id,
  }, [
    { title: "Checklist draft", dueDate: daysAgo(20), status: "APPROVED", note: "First draft covering all core GDPR articles relevant to SME clients.", submittedAt: daysAgo(21) },
    { title: "Final checklist + summary one-pager", dueDate: daysAgo(4), status: "APPROVED", note: "Final PDF + one-pager delivered, plain-language pass complete.", submittedAt: daysAgo(5) },
  ]);

  const t6 = await makeTask({
    smeId: greenfields.id, title: "Translate investor FAQ into German and French",
    description: "We have a 6-page investor FAQ in English that needs a careful translation into German and French, keeping financial terminology accurate.",
    industry: "Logistics", language: "German", deliverableType: "Translation", dueDate: daysFromNow(30), remuneration: 200, postedAt: daysAgo(0), status: "OPEN",
  }, [
    { title: "Draft translation (both languages)", dueDate: daysFromNow(15) },
    { title: "Final proofread & delivery", dueDate: daysFromNow(28) },
  ]);

  console.log("Creating applications...");
  await sql`INSERT INTO applications (task_id, student_id, status, applied_at, cover_note) VALUES
    (${t1.id}, ${anna.id}, 'PENDING', ${daysAgo(1)}, ${"I've written 3 market-entry reports before for mobility startups, happy to start immediately."}),
    (${t1.id}, ${julia.id}, 'PENDING', ${daysAgo(1)}, ${"This fits well with my finance coursework, I can bring a numbers-first angle."}),
    (${t3.id}, ${marco.id}, 'ACCEPTED', ${daysAgo(14)}, ${"I focus on brand identity work, attached my portfolio link in DM."}),
    (${t3.id}, ${sam.id}, 'REJECTED', ${daysAgo(14)}, ${"I can also take on design tasks alongside dev work."}),
    (${t4.id}, ${sam.id}, 'ACCEPTED', ${daysAgo(19)}, ${"I've built 4 prototypes like this before, can share examples."}),
    (${t5.id}, ${anna.id}, 'ACCEPTED', ${daysAgo(39)}, ${"I took a data protection law elective last semester, this is right up my street."})
  `;

  console.log("Creating contracts...");
  const [c1] = await sql`INSERT INTO contracts (task_id, sme_id, student_id, status, student_legal_name, student_address, student_iban, student_tax_id, gross_remuneration, net_to_student, start_date, end_date, signed_at_sme, signed_at_student)
    VALUES (${t3.id}, ${greenfields.id}, ${marco.id}, 'SIGNED', 'Marco A. Tessier', 'Sint Annalaan 12, 6213 Maastricht, Netherlands', 'NL00ADEC0123456789', 'NL1234.56.789', 500, 425, ${daysAgo(13)}, ${daysFromNow(20)}, ${daysAgo(13)}, ${daysAgo(12)}) RETURNING id`;
  await sql`UPDATE tasks SET contract_id = ${c1.id} WHERE id = ${t3.id}`;

  const [c2] = await sql`INSERT INTO contracts (task_id, sme_id, student_id, status, student_legal_name, student_address, student_iban, student_tax_id, gross_remuneration, net_to_student, start_date, end_date, signed_at_sme, signed_at_student)
    VALUES (${t4.id}, ${nova.id}, ${sam.id}, 'SIGNED', 'Samuel O. Okafor', 'Bonnefantenstraat 4, 6211 Maastricht, Netherlands', 'NL00ADEC0987654321', 'NL9876.54.321', 600, 510, ${daysAgo(19)}, ${daysFromNow(9)}, ${daysAgo(19)}, ${daysAgo(18)}) RETURNING id`;
  await sql`UPDATE tasks SET contract_id = ${c2.id} WHERE id = ${t4.id}`;

  const [c3] = await sql`INSERT INTO contracts (task_id, sme_id, student_id, status, student_legal_name, student_address, student_iban, student_tax_id, gross_remuneration, net_to_student, start_date, end_date, signed_at_sme, signed_at_student)
    VALUES (${t5.id}, ${vellum.id}, ${anna.id}, 'SIGNED', 'Anna J. de Vries', 'Tongersestraat 53, 6211 Maastricht, Netherlands', 'NL00ADEC0192837465', 'NL1928.37.465', 350, 297.5, ${daysAgo(40)}, ${daysAgo(3)}, ${daysAgo(40)}, ${daysAgo(39)}) RETURNING id`;
  await sql`UPDATE tasks SET contract_id = ${c3.id} WHERE id = ${t5.id}`;

  console.log("Creating messages...");
  await sql`INSERT INTO messages (task_id, from_user_id, from_role, text, created_at) VALUES
    (${t4.id}, ${nova.id}, 'SME', 'Hey Sam, looking forward to seeing the wireframes!', ${daysAgo(10)}),
    (${t4.id}, ${sam.id}, 'STUDENT', 'Just submitted them on the milestone, let me know your thoughts.', ${hoursAgo(238)}),
    (${t4.id}, ${nova.id}, 'SME', 'These look great, approved! Starting on the build now?', ${hoursAgo(216)}),
    (${t4.id}, ${sam.id}, 'STUDENT', 'Yep, started today, will share a staging link once responsive QA is done.', ${hoursAgo(214)})
  `;

  console.log("Creating notifications...");
  await sql`INSERT INTO notifications (user_id, text, read, link_view, link_task_id, created_at) VALUES
    (${greenfields.id}, ${"Anna de Vries applied to 'Market entry research for Benelux e-bike rental'"}, false, 'sme-applicants', ${t1.id}, ${daysAgo(1)}),
    (${greenfields.id}, ${"Julia Hoffmann applied to 'Market entry research for Benelux e-bike rental'"}, false, 'sme-applicants', ${t1.id}, ${daysAgo(1)}),
    (${nova.id}, ${"Sam Okafor submitted the milestone 'Build & responsive QA'"}, false, 'task-workspace', ${t4.id}, ${daysAgo(2)}),
    (${sam.id}, ${"Your milestone 'Wireframes' was approved"}, true, 'task-workspace', ${t4.id}, ${daysAgo(10)}),
    (${marco.id}, 'Greenfields Logistics accepted your application', true, 'task-workspace', ${t3.id}, ${daysAgo(14)})
  `;

  console.log("Creating ratings...");
  await sql`INSERT INTO ratings (task_id, from_role, to_user_id, score, comment) VALUES
    (${t5.id}, 'SME', ${anna.id}, 5, 'Excellent, thorough work, delivered ahead of schedule.'),
    (${t5.id}, 'STUDENT', ${vellum.id}, 4, 'Clear brief, fast payment, would work with them again.')
  `;

  console.log("Done seeding.");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
