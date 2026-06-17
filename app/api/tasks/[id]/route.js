import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapTask, mapMilestone, mapSme, mapStudent } from "@/lib/mappers";

export async function GET(request, { params }) {
  const { id } = params;
  const [row] = await db`
    SELECT t.*, p.company_name, p.verified AS sme_verified
    FROM tasks t JOIN sme_profiles p ON p.user_id = t.sme_id
    WHERE t.id = ${id}
  `;
  if (!row) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const task = mapTask(row);
  task.milestones = (await db`SELECT * FROM milestones WHERE task_id = ${id} ORDER BY position ASC`).map(mapMilestone);

  const [smeRow] = await db`SELECT * FROM sme_profiles WHERE user_id = ${task.smeId}`;
  const sme = mapSme(smeRow);

  let student = null;
  if (task.allocatedStudentId) {
    const [studentRow] = await db`SELECT * FROM student_profiles WHERE user_id = ${task.allocatedStudentId}`;
    if (studentRow) student = mapStudent(studentRow);
  }

  return NextResponse.json({ task, sme, student });
}
