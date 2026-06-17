import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { mapApplication, mapTask } from "@/lib/mappers";

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const mine = searchParams.get("mine") === "1";

  if (mine) {
    if (session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    const rows = await db`
      SELECT a.*, t.title, t.remuneration, t.due_date, t.status AS task_status, p.company_name
      FROM applications a
      JOIN tasks t ON t.id = a.task_id
      JOIN sme_profiles p ON p.user_id = t.sme_id
      WHERE a.student_id = ${session.userId}
      ORDER BY a.applied_at DESC
    `;
    return NextResponse.json({
      applications: rows.map((r) => ({
        ...mapApplication(r),
        task: { title: r.title, remuneration: Number(r.remuneration), dueDate: r.due_date, status: r.task_status },
        smeCompanyName: r.company_name,
      })),
    });
  }

  if (taskId) {
    const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (session.role !== "SME" || task.sme_id !== session.userId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    const rows = await db`
      SELECT a.*, s.full_name, s.university, s.languages, s.skills, s.completed_tasks_count, s.rating, s.verified
      FROM applications a
      JOIN student_profiles s ON s.user_id = a.student_id
      WHERE a.task_id = ${taskId}
      ORDER BY a.applied_at ASC
    `;
    return NextResponse.json({
      applications: rows.map((r) => ({
        ...mapApplication(r),
        student: {
          id: r.student_id, fullName: r.full_name, university: r.university, languages: r.languages,
          skills: r.skills, completedTasksCount: r.completed_tasks_count,
          rating: r.rating !== null ? Number(r.rating) : null, verified: r.verified,
        },
      })),
    });
  }

  return NextResponse.json({ error: "taskId or mine=1 query param required." }, { status: 400 });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can apply to tasks." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { taskId, coverNote } = body;
  if (!taskId || !coverNote || !coverNote.trim()) {
    return NextResponse.json({ error: "A short note is required to apply." }, { status: 400 });
  }

  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  if (task.status !== "OPEN") return NextResponse.json({ error: "This task is no longer accepting applications." }, { status: 400 });

  try {
    const [app] = await db`
      INSERT INTO applications (task_id, student_id, cover_note)
      VALUES (${taskId}, ${session.userId}, ${coverNote})
      RETURNING *
    `;
    const [student] = await db`SELECT full_name FROM student_profiles WHERE user_id = ${session.userId}`;
    await notify(task.sme_id, `${student.full_name} applied to "${task.title}"`, { view: "sme-applicants", taskId });
    return NextResponse.json({ application: mapApplication(app) }, { status: 201 });
  } catch (e) {
    if (String(e.message).includes("duplicate key")) {
      return NextResponse.json({ error: "You've already applied to this task." }, { status: 409 });
    }
    throw e;
  }
}
