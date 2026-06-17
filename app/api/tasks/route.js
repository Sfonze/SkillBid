import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapTask, mapMilestone } from "@/lib/mappers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "1";
  const allocatedToMe = searchParams.get("allocatedToMe") === "1";
  const statusFilter = searchParams.get("status"); // 'open' | 'in_progress' | 'completed' | null (=open by default for public browse)

  let rows;
  if (mine) {
    const session = await getSession();
    if (!session || session.role !== "SME") {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    rows = await db`
      SELECT t.*, p.company_name, p.verified AS sme_verified, c.status AS contract_status, c.net_to_student
      FROM tasks t
      JOIN sme_profiles p ON p.user_id = t.sme_id
      LEFT JOIN contracts c ON c.id = t.contract_id
      WHERE t.sme_id = ${session.userId}
      ORDER BY t.posted_at DESC
    `;
  } else if (allocatedToMe) {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    rows = await db`
      SELECT t.*, p.company_name, p.verified AS sme_verified, c.status AS contract_status, c.net_to_student
      FROM tasks t
      JOIN sme_profiles p ON p.user_id = t.sme_id
      LEFT JOIN contracts c ON c.id = t.contract_id
      WHERE t.allocated_student_id = ${session.userId}
      ORDER BY t.posted_at DESC
    `;
  } else {
    const status = statusFilter ? statusFilter.toUpperCase() : "OPEN";
    rows = await db`
      SELECT t.*, p.company_name, p.verified AS sme_verified, c.status AS contract_status, c.net_to_student
      FROM tasks t
      JOIN sme_profiles p ON p.user_id = t.sme_id
      LEFT JOIN contracts c ON c.id = t.contract_id
      WHERE t.status = ${status}
      ORDER BY t.posted_at DESC
    `;
  }

  const tasks = rows.map((r) => ({
    ...mapTask(r),
    contractStatus: r.contract_status || null,
    contractNetToStudent: r.net_to_student !== undefined && r.net_to_student !== null ? Number(r.net_to_student) : null,
  }));
  const ids = tasks.map((t) => t.id);
  let milestoneRows = [];
  if (ids.length > 0) {
    milestoneRows = await db`SELECT * FROM milestones WHERE task_id IN ${db(ids)} ORDER BY position ASC`;
  }
  const byTask = {};
  for (const m of milestoneRows.map(mapMilestone)) {
    byTask[m.taskId] = byTask[m.taskId] || [];
    byTask[m.taskId].push(m);
  }
  for (const t of tasks) t.milestones = byTask[t.id] || [];

  return NextResponse.json({ tasks });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "SME") {
    return NextResponse.json({ error: "Only companies can post tasks." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { title, description, industry, language, deliverableType, dueDate, remuneration, milestones } = body;

  if (!title || !title.trim()) return NextResponse.json({ error: "Give the task a title." }, { status: 400 });
  if (!description || description.trim().length < 20) return NextResponse.json({ error: "Description needs at least 20 characters." }, { status: 400 });
  if (!dueDate) return NextResponse.json({ error: "Set a due date." }, { status: 400 });
  if (!remuneration || Number(remuneration) <= 0) return NextResponse.json({ error: "Set the remuneration amount." }, { status: 400 });
  if (!Array.isArray(milestones) || milestones.length === 0 || milestones.some((m) => !m.title || !m.dueDate)) {
    return NextResponse.json({ error: "Every milestone needs a title and due date." }, { status: 400 });
  }

  const [task] = await db`
    INSERT INTO tasks (sme_id, title, description, industry, language, deliverable_type, due_date, remuneration)
    VALUES (${session.userId}, ${title}, ${description}, ${industry}, ${language}, ${deliverableType}, ${dueDate}, ${Number(remuneration)})
    RETURNING *
  `;

  for (let i = 0; i < milestones.length; i++) {
    await db`
      INSERT INTO milestones (task_id, position, title, due_date)
      VALUES (${task.id}, ${i}, ${milestones[i].title}, ${milestones[i].dueDate})
    `;
  }

  return NextResponse.json({ task: mapTask(task) }, { status: 201 });
}
