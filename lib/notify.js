import { db } from "@/lib/db";

export async function notify(userId, text, link) {
  await db`
    INSERT INTO notifications (user_id, text, link_view, link_task_id)
    VALUES (${userId}, ${text}, ${link?.view || null}, ${link?.taskId || null})
  `;
}
