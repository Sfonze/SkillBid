import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapContract, mapTask, mapSme, mapStudent } from "@/lib/mappers";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { taskId } = params;

  const [taskRow] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!taskRow || !taskRow.contract_id) {
    return NextResponse.json({ error: "No contract for this task." }, { status: 404 });
  }
  const [contractRow] = await db`SELECT * FROM contracts WHERE id = ${taskRow.contract_id}`;
  if (session.userId !== contractRow.sme_id && session.userId !== contractRow.student_id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const [smeRow] = await db`SELECT * FROM sme_profiles WHERE user_id = ${taskRow.sme_id}`;
  const [studentRow] = await db`SELECT * FROM student_profiles WHERE user_id = ${taskRow.allocated_student_id}`;

  return NextResponse.json({
    task: mapTask(taskRow),
    contract: mapContract(contractRow),
    sme: mapSme(smeRow),
    student: mapStudent(studentRow),
  });
}
