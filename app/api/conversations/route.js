import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let taskRows;
  if (session.role === "STUDENT") {
    taskRows = await db`
      SELECT t.id AS task_id, t.title, t.status, t.sme_id AS counterpart_id, p.company_name AS counterpart_name
      FROM tasks t JOIN sme_profiles p ON p.user_id = t.sme_id
      WHERE t.allocated_student_id = ${session.userId}
      ORDER BY t.posted_at DESC
    `;
  } else {
    taskRows = await db`
      SELECT t.id AS task_id, t.title, t.status, t.allocated_student_id AS counterpart_id, sp.full_name AS counterpart_name
      FROM tasks t JOIN student_profiles sp ON sp.user_id = t.allocated_student_id
      WHERE t.sme_id = ${session.userId} AND t.allocated_student_id IS NOT NULL
      ORDER BY t.posted_at DESC
    `;
  }

  if (taskRows.length === 0) return NextResponse.json({ conversations: [] });
  const taskIds = taskRows.map((t) => t.task_id);

  const lastMessages = await db`
    SELECT DISTINCT ON (task_id) task_id, text, from_role, created_at
    FROM messages WHERE task_id IN ${db(taskIds)}
    ORDER BY task_id, created_at DESC
  `;
  const lastByTask = Object.fromEntries(lastMessages.map((m) => [m.task_id, m]));

  const unreadNotifs = await db`
    SELECT link_task_id, COUNT(*) AS c FROM notifications
    WHERE user_id = ${session.userId} AND read = false AND link_view = 'task-workspace' AND link_task_id IN ${db(taskIds)}
    GROUP BY link_task_id
  `;
  const unreadByTask = Object.fromEntries(unreadNotifs.map((n) => [n.link_task_id, Number(n.c)]));

  const conversations = taskRows.map((t) => ({
    taskId: t.task_id,
    taskTitle: t.title,
    taskStatus: t.status,
    counterpartId: t.counterpart_id,
    counterpartName: t.counterpart_name,
    lastMessage: lastByTask[t.task_id] ? { text: lastByTask[t.task_id].text, fromRole: lastByTask[t.task_id].from_role, timestamp: lastByTask[t.task_id].created_at } : null,
    unreadCount: unreadByTask[t.task_id] || 0,
  }));

  conversations.sort((a, b) => {
    const at = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
    const bt = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
    return bt - at;
  });

  return NextResponse.json({ conversations });
}
