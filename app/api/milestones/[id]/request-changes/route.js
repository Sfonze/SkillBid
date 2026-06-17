import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "SME") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { note } = body;
  if (!note || !note.trim()) return NextResponse.json({ error: "Describe what needs to change." }, { status: 400 });

  const [milestone] = await db`SELECT * FROM milestones WHERE id = ${id}`;
  if (!milestone) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  const [task] = await db`SELECT * FROM tasks WHERE id = ${milestone.task_id}`;
  if (task.sme_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (milestone.status !== "SUBMITTED") return NextResponse.json({ error: "Nothing submitted to comment on." }, { status: 400 });

  await db`UPDATE milestones SET status = 'CHANGES_REQUESTED', note = ${note} WHERE id = ${id}`;
  await notify(task.allocated_student_id, `Changes requested on "${milestone.title}"`, { view: "task-workspace", taskId: task.id });

  return NextResponse.json({ ok: true });
}
