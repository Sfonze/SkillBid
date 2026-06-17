import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required." }, { status: 400 });
  const rows = await db`SELECT * FROM ratings WHERE task_id = ${taskId}`;
  return NextResponse.json({
    ratings: rows.map((r) => ({ id: r.id, taskId: r.task_id, fromRole: r.from_role, toUserId: r.to_user_id, score: r.score, comment: r.comment })),
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { taskId, score, comment } = body;
  if (!taskId || !score) return NextResponse.json({ error: "A star rating is required." }, { status: 400 });

  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  if (task.status !== "COMPLETED") return NextResponse.json({ error: "Task isn't completed yet." }, { status: 400 });

  const toUserId = session.role === "SME" ? task.allocated_student_id : task.sme_id;
  if (session.userId !== task.sme_id && session.userId !== task.allocated_student_id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    await db`
      INSERT INTO ratings (task_id, from_role, to_user_id, score, comment)
      VALUES (${taskId}, ${session.role}, ${toUserId}, ${score}, ${comment || null})
    `;
  } catch (e) {
    if (String(e.message).includes("duplicate key")) {
      return NextResponse.json({ error: "You've already rated this task." }, { status: 409 });
    }
    throw e;
  }

  if (session.role === "SME") {
    const avg = await db`SELECT AVG(score)::numeric(3,2) AS avg FROM ratings WHERE to_user_id = ${toUserId} AND score IS NOT NULL`;
    await db`UPDATE student_profiles SET rating = ${avg[0].avg} WHERE user_id = ${toUserId}`;
  }

  return NextResponse.json({ ok: true });
}
