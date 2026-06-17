import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "SME") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = params;

  const [milestone] = await db`SELECT * FROM milestones WHERE id = ${id}`;
  if (!milestone) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  const [task] = await db`SELECT * FROM tasks WHERE id = ${milestone.task_id}`;
  if (task.sme_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (milestone.status !== "SUBMITTED") return NextResponse.json({ error: "Nothing to approve yet." }, { status: 400 });

  await db`UPDATE milestones SET status = 'APPROVED' WHERE id = ${id}`;
  await notify(task.allocated_student_id, `Milestone "${milestone.title}" was approved`, { view: "task-workspace", taskId: task.id });

  const remaining = await db`SELECT id FROM milestones WHERE task_id = ${task.id} AND status != 'APPROVED'`;
  let completed = false;
  if (remaining.length === 0) {
    completed = true;
    await db`UPDATE tasks SET status = 'COMPLETED' WHERE id = ${task.id}`;
    await db`UPDATE student_profiles SET completed_tasks_count = completed_tasks_count + 1 WHERE user_id = ${task.allocated_student_id}`;
    await db`UPDATE sme_profiles SET tasks_completed_before = tasks_completed_before + 1 WHERE user_id = ${task.sme_id}`;
    await notify(task.allocated_student_id, `Task "${task.title}" complete — payment released`, { view: "task-workspace", taskId: task.id });
    await notify(task.sme_id, `Task "${task.title}" marked complete`, { view: "task-workspace", taskId: task.id });
  }

  return NextResponse.json({ ok: true, taskCompleted: completed });
}
