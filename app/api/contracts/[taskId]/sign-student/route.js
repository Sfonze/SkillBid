import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { taskId } = params;

  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task || !task.contract_id) return NextResponse.json({ error: "No contract for this task." }, { status: 404 });
  const [contract] = await db`SELECT * FROM contracts WHERE id = ${task.contract_id}`;
  if (contract.student_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (contract.status !== "PENDING_STUDENT_SIGNATURE") return NextResponse.json({ error: "Not ready for this step." }, { status: 400 });

  await db`UPDATE contracts SET status = 'SIGNED', signed_at_student = now() WHERE id = ${contract.id}`;
  await notify(task.sme_id, `Contract fully signed — task is now in progress`, { view: "task-workspace", taskId });

  return NextResponse.json({ ok: true });
}
