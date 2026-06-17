import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { note } = body;
  if (!note || !note.trim()) return NextResponse.json({ error: "Describe what you're submitting." }, { status: 400 });

  const [milestone] = await db`SELECT * FROM milestones WHERE id = ${id}`;
  if (!milestone) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  const [task] = await db`SELECT * FROM tasks WHERE id = ${milestone.task_id}`;
  if (task.allocated_student_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (!["PENDING", "CHANGES_REQUESTED"].includes(milestone.status)) {
    return NextResponse.json({ error: "This milestone isn't awaiting a submission." }, { status: 400 });
  }

  await db`UPDATE milestones SET status = 'SUBMITTED', note = ${note}, submitted_at = now() WHERE id = ${id}`;
  await notify(task.sme_id, `Milestone "${milestone.title}" submitted for review`, { view: "task-workspace", taskId: task.id });

  return NextResponse.json({ ok: true });
}
