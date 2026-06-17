import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { mapMessage } from "@/lib/mappers";

async function assertTaskAccess(session, taskId) {
  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task) return { error: "Task not found.", status: 404 };
  if (task.sme_id !== session.userId && task.allocated_student_id !== session.userId) {
    return { error: "Not authorized.", status: 401 };
  }
  return { task };
}

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required." }, { status: 400 });

  const access = await assertTaskAccess(session, taskId);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

  const rows = await db`SELECT * FROM messages WHERE task_id = ${taskId} ORDER BY created_at ASC`;
  return NextResponse.json({ messages: rows.map(mapMessage) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { taskId, text } = body;
  if (!taskId || !text || !text.trim()) return NextResponse.json({ error: "Message text required." }, { status: 400 });

  const access = await assertTaskAccess(session, taskId);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });
  const { task } = access;

  const [msg] = await db`
    INSERT INTO messages (task_id, from_user_id, from_role, text)
    VALUES (${taskId}, ${session.userId}, ${session.role}, ${text})
    RETURNING *
  `;
  const otherId = session.role === "SME" ? task.allocated_student_id : task.sme_id;
  if (otherId) await notify(otherId, `New message on "${task.title}"`, { view: "task-workspace", taskId });

  return NextResponse.json({ message: mapMessage(msg) }, { status: 201 });
}
