// Run with: node test/integration.js  (server must already be running on :3000)
const BASE = "http://localhost:3000";

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { console.log("OK:", msg); pass++; }
  else { console.error("FAIL:", msg); fail++; }
}

// Minimal per-actor cookie jar so we can run two logged-in actors (SME + student) concurrently.
function makeActor() {
  let cookie = "";
  async function req(method, path, body) {
    const res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    let data = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, ok: res.ok, data };
  }
  return { req };
}

async function main() {
  const sme = makeActor();
  const student = makeActor();
  const newSme = makeActor();

  // --- login as seeded SME ---
  let r = await sme.req("POST", "/api/auth/login", { role: "sme", email: "hr@greenfieldslogistics.nl", password: "demo1234" });
  assert(r.ok && r.data.role === "SME", "SME login succeeds");

  r = await sme.req("GET", "/api/me");
  assert(r.data.user && r.data.user.companyName === "Greenfields Logistics B.V.", "SME /api/me returns correct profile");

  // --- wrong password fails ---
  r = await makeActor().req("POST", "/api/auth/login", { role: "sme", email: "hr@greenfieldslogistics.nl", password: "wrongpass" });
  assert(r.status === 401, "Wrong password is rejected");

  // --- post a new task as SME ---
  r = await sme.req("POST", "/api/tasks", {
    title: "Integration Test Task",
    description: "This is an integration-test task description with enough characters to pass validation.",
    industry: "Software & IT", language: "English", deliverableType: "Data analysis",
    dueDate: "2026-12-31", remuneration: 100,
    milestones: [{ title: "Only milestone", dueDate: "2026-12-20" }],
  });
  assert(r.status === 201, "SME can post a new task");
  const taskId = r.data.task.id;

  r = await sme.req("GET", "/api/tasks?mine=1");
  assert(r.data.tasks.some((t) => t.id === taskId), "New task appears in SME's own task list");

  r = await fetch(BASE + "/api/tasks?status=open").then((x) => x.json());
  assert(r.tasks.some((t) => t.id === taskId), "New task is publicly visible in open browse list");

  // --- sign up a brand-new student ---
  r = await student.req("POST", "/api/auth/signup-student", {
    fullName: "QA Test Student",
    universityEmail: "qa.test@student.maastrichtuniversity.nl",
    university: "Maastricht University",
    languages: ["English"],
    skills: ["Testing", "QA"],
    password: "testpass1",
  });
  assert(r.ok && r.data.verified === true, "New student signup succeeds and is auto-verified (recognised domain)");

  r = await student.req("GET", "/api/me");
  assert(r.data.user.fullName === "QA Test Student", "Student /api/me returns correct profile");

  // --- apply to the new task ---
  r = await student.req("POST", "/api/applications", { taskId, coverNote: "I would like to help with this." });
  assert(r.status === 201, "Student can apply to the task");
  const applicationId = r.data.application.id;

  r = await student.req("POST", "/api/applications", { taskId, coverNote: "Again" });
  assert(r.status === 409, "Duplicate application is rejected");

  r = await student.req("GET", "/api/applications?mine=1");
  assert(r.data.applications.some((a) => a.id === applicationId), "Application appears in student's basket");

  // --- SME reviews applicants ---
  r = await sme.req("GET", `/api/applications?taskId=${taskId}`);
  assert(r.data.applications.length === 1 && r.data.applications[0].student.fullName === "QA Test Student", "SME sees the applicant with profile info");

  // unauthorized actor can't review
  r = await student.req("GET", `/api/applications?taskId=${taskId}`);
  assert(r.status === 401, "A student cannot view applicant review data for someone else's task");

  // --- accept application, contract should be created ---
  r = await sme.req("PATCH", `/api/applications/${applicationId}`, { action: "accept" });
  assert(r.ok && r.data.contractId, "Accepting application creates a contract");
  const contractId = r.data.contractId;

  r = await fetch(BASE + `/api/tasks/${taskId}`).then((x) => x.json());
  assert(r.task.status === "IN_PROGRESS" && r.task.allocatedStudentId, "Task flips to IN_PROGRESS with allocated student");

  // --- contract flow: student submits info ---
  r = await student.req("GET", `/api/contracts/${taskId}`);
  assert(r.ok && r.data.contract.status === "PENDING_STUDENT_INFO", "Contract starts in pending_student_info");

  r = await sme.req("POST", `/api/contracts/${taskId}/student-info`, { legalName: "X", address: "Y", iban: "Z", taxId: "W" });
  assert(r.status === 401, "SME cannot submit student info");

  r = await student.req("POST", `/api/contracts/${taskId}/student-info`, {
    legalName: "Quentin A. Test", address: "Teststraat 1, Maastricht", iban: "NL00TEST0000000001", taxId: "NL0000.00.001",
  });
  assert(r.ok, "Student submits employment details");

  r = await student.req("GET", `/api/contracts/${taskId}`);
  assert(r.data.contract.status === "PENDING_SME_SIGNATURE", "Contract advances to pending_sme_signature");

  // --- SME signs ---
  r = await student.req("POST", `/api/contracts/${taskId}/sign-sme`);
  assert(r.status === 401, "Student cannot sign as the company");

  r = await sme.req("POST", `/api/contracts/${taskId}/sign-sme`);
  assert(r.ok, "SME signs the contract");

  r = await sme.req("GET", `/api/contracts/${taskId}`);
  assert(r.data.contract.status === "PENDING_STUDENT_SIGNATURE" && r.data.contract.signedAtSme, "Contract advances to pending_student_signature");

  // --- student signs ---
  r = await student.req("POST", `/api/contracts/${taskId}/sign-student`);
  assert(r.ok, "Student signs the contract");

  r = await student.req("GET", `/api/contracts/${taskId}`);
  assert(r.data.contract.status === "SIGNED" && r.data.contract.signedAtStudent, "Contract is fully signed");
  assert(r.data.contract.terms.netToStudent === 85, "Net-to-student correctly computed as gross minus 15% commission (100 -> 85)");

  // --- milestone submit / approve -> task completion ---
  r = await fetch(BASE + `/api/tasks/${taskId}`).then((x) => x.json());
  const milestoneId = r.task.milestones[0].id;

  r = await sme.req("POST", `/api/milestones/${milestoneId}/submit`, { note: "trying as wrong role" });
  assert(r.status === 401, "SME cannot submit a milestone deliverable");

  r = await student.req("POST", `/api/milestones/${milestoneId}/submit`, { note: "Here is my deliverable, link: example.com/result" });
  assert(r.ok, "Student submits the milestone deliverable");

  r = await student.req("POST", `/api/milestones/${milestoneId}/approve`);
  assert(r.status === 401, "Student cannot approve their own milestone");

  r = await sme.req("POST", `/api/milestones/${milestoneId}/approve`);
  assert(r.ok && r.data.taskCompleted === true, "SME approves the sole milestone, completing the task");

  r = await fetch(BASE + `/api/tasks/${taskId}`).then((x) => x.json());
  assert(r.task.status === "COMPLETED", "Task status is now COMPLETED");

  // --- messaging ---
  r = await student.req("POST", "/api/messages", { taskId, text: "Thanks for the quick approval!" });
  assert(r.status === 201, "Student can send a message on a shared task");

  r = await sme.req("GET", `/api/messages?taskId=${taskId}`);
  assert(r.data.messages.some((m) => m.text === "Thanks for the quick approval!"), "SME sees the student's message");

  r = await sme.req("GET", "/api/notifications");
  assert(r.data.notifications.some((n) => n.text.includes("New message")), "SME has a notification about the new message");

  r = await sme.req("PATCH", "/api/notifications");
  assert(r.ok, "Notifications can be marked read");
  r = await sme.req("GET", "/api/notifications");
  assert(r.data.notifications.every((n) => n.read), "All notifications are now marked read");

  // --- ratings ---
  r = await sme.req("POST", "/api/ratings", { taskId, score: 5, comment: "Great work, delivered on time." });
  assert(r.ok, "SME rates the student");
  r = await sme.req("POST", "/api/ratings", { taskId, score: 5, comment: "again" });
  assert(r.status === 409, "Duplicate rating from the same role is rejected");

  r = await student.req("POST", "/api/ratings", { taskId, score: 4, comment: "Clear brief, paid quickly." });
  assert(r.ok, "Student rates the company back");

  r = await student.req("GET", "/api/me");
  assert(r.data.user.completedTasksCount >= 1, "Student's completed task count incremented");
  assert(r.data.user.rating === 5, "Student's average rating updated to 5.0 after the SME's 5-star rating");

  r = await student.req("GET", "/api/tasks?allocatedToMe=1");
  const completedEntry = r.data.tasks.find((t) => t.id === taskId);
  assert(completedEntry && completedEntry.contractNetToStudent === 85, "Student dashboard task list shows correct net payout");

  // --- reject path on seeded data: Julia is pending on task t1 (Market entry research) ---
  r = await fetch(BASE + "/api/tasks?status=open").then((x) => x.json());
  const t1 = r.tasks.find((t) => t.title.includes("Market entry research"));
  assert(!!t1, "Seeded open task is present");

  r = await sme.req("GET", `/api/applications?taskId=${t1.id}`);
  const juliaApp = r.data.applications.find((a) => a.student.fullName === "Julia Hoffmann");
  assert(juliaApp && juliaApp.student.verified === false, "Julia (non-university email in seed data) shows as unverified");

  r = await sme.req("PATCH", `/api/applications/${juliaApp.id}`, { action: "reject" });
  assert(r.ok, "SME rejects Julia's application");

  // --- withdraw path: Anna has a pending application on t1 in seed data ---
  const annaActor = makeActor();
  r = await annaActor.req("POST", "/api/auth/login", { role: "student", email: "anna.devries@student.maastrichtuniversity.nl", password: "demo1234" });
  assert(r.ok, "Seeded student Anna can log in");
  r = await annaActor.req("GET", "/api/applications?mine=1");
  const annaApp = r.data.applications.find((a) => a.task.title.includes("Market entry research"));
  assert(!!annaApp, "Anna has her seeded pending application");
  r = await annaActor.req("PATCH", `/api/applications/${annaApp.id}`, { action: "withdraw" });
  assert(r.ok, "Anna withdraws her application");
  r = await annaActor.req("GET", "/api/applications?mine=1");
  assert(!r.data.applications.some((a) => a.id === annaApp.id), "Withdrawn application no longer appears in Anna's basket");

  // --- new SME signup with implausible VAT shows unverified ---
  r = await newSme.req("POST", "/api/auth/signup-sme", {
    companyName: "QA Test Ventures", foundationDate: "2020-01-01", vatNumber: "not-a-vat",
    coreBusiness: "QA testing services", tasksCompletedBefore: 0, email: "founder@qatestventures.nl", password: "foundme123",
  });
  assert(r.ok && r.data.verified === false, "SME with implausible VAT format is created as unverified");

  // ================= NEW: PROFILES, TALENT DIRECTORY, MESSAGING HUB =================

  // --- public student profile ---
  r = await fetch(BASE + "/api/talent").then((x) => x.json());
  assert(r.students.length >= 4, "Talent directory lists seeded students");
  const annaTalent = r.students.find((s) => s.fullName === "Anna de Vries");
  assert(annaTalent && annaTalent.headline === "Marketing & Research Specialist", "Talent listing includes headline");
  assert(annaTalent.skillLevels.length > 0, "Talent listing includes skill levels");

  r = await fetch(BASE + `/api/profile/student/${annaTalent.id}`).then((x) => x.json());
  assert(r.student.bio.includes("MSc International Business"), "Public student profile route returns bio");

  // --- public SME profile ---
  const smeMeRes = await sme.req("GET", "/api/me");
  const greenfieldsId = smeMeRes.data.user.id;
  r = await fetch(BASE + `/api/profile/sme/${greenfieldsId}`).then((x) => x.json());
  assert(r.sme.bio.includes("electric last-mile"), "Public SME profile route returns bio");

  // --- student edits own profile ---
  r = await annaActor.req("GET", "/api/profile/student/me");
  assert(r.ok, "Student can fetch own editable profile");
  r = await annaActor.req("PATCH", "/api/profile/student/me", {
    headline: "Updated headline", bio: "Updated bio text.", location: "Eindhoven, Netherlands",
    responseTime: "within an hour", hoursPerWeek: 25,
    skillLevels: [{ name: "Excel", level: 95 }],
  });
  assert(r.ok && r.data.student.headline === "Updated headline", "Student profile update saves correctly");
  r = await fetch(BASE + `/api/profile/student/${annaTalent.id}`).then((x) => x.json());
  assert(r.student.location === "Eindhoven, Netherlands", "Updated profile reflects immediately on public route");

  // unauthorized role can't edit a student profile
  r = await sme.req("PATCH", "/api/profile/student/me", { headline: "hacked" });
  assert(r.status === 401, "SME cannot edit a student profile via the student endpoint");

  // --- SME edits own profile ---
  r = await sme.req("PATCH", "/api/profile/sme/me", { bio: "Updated company bio.", location: "Maastricht, Netherlands" });
  assert(r.ok && r.data.sme.bio === "Updated company bio.", "SME profile update saves correctly");

  // --- messaging hub / conversations ---
  r = await sme.req("GET", "/api/conversations");
  assert(r.ok && Array.isArray(r.data.conversations), "SME can fetch conversation list");
  const convoWithMarco = r.data.conversations.find((c) => c.counterpartName === "Marco Tessier");
  assert(!!convoWithMarco, "SME (Greenfields) sees a conversation with their allocated student Marco");

  const samActor = makeActor();
  r = await samActor.req("POST", "/api/auth/login", { role: "student", email: "s.okafor@student.maastrichtuniversity.nl", password: "demo1234" });
  assert(r.ok, "Seeded student Sam can log in");
  r = await samActor.req("GET", "/api/conversations");
  const convoWithNova = r.data.conversations.find((c) => c.counterpartName === "Nova Studio");
  assert(!!convoWithNova, "Student sees a conversation with the company they're working with");
  assert(convoWithNova.lastMessage && convoWithNova.lastMessage.text.includes("started today"), "Conversation includes the correct last message preview");

  // a brand new student with no allocated tasks sees an empty conversation list
  const freshStudent = makeActor();
  r = await freshStudent.req("POST", "/api/auth/signup-student", {
    fullName: "Fresh Student", universityEmail: "fresh.student@student.maastrichtuniversity.nl",
    university: "Maastricht University", languages: ["English"], skills: [], password: "freshpass1",
  });
  assert(r.ok, "Fresh student account created for empty-state check");
  r = await freshStudent.req("GET", "/api/conversations");
  assert(r.ok && r.data.conversations.length === 0, "Student with no allocated tasks has an empty conversation list");

  console.log(`\n${pass} passed, ${fail} failed.\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error("TEST THREW:", e); process.exit(1); });
