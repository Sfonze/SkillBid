import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { COMMISSION_RATE } from "@/lib/validators";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { action } = body;

  const [app] = await db`SELECT * FROM applications WHERE id = ${id}`;
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  const [task] = await db`SELECT * FROM tasks WHERE id = ${app.task_id}`;

  if (action === "withdraw") {
    if (session.role !== "STUDENT" || app.student_id !== session.userId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    if (app.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending applications can be withdrawn." }, { status: 400 });
    }
    await db`DELETE FROM applications WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    if (session.role !== "SME" || task.sme_id !== session.userId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    await db`UPDATE applications SET status = 'REJECTED' WHERE id = ${id}`;
    await notify(app.student_id, `You weren't selected for "${task.title}"`, { view: "browse-tasks" });
    return NextResponse.json({ ok: true });
  }

  if (action === "accept") {
    if (session.role !== "SME" || task.sme_id !== session.userId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    if (task.status !== "OPEN") {
      return NextResponse.json({ error: "This task already has an allocated student." }, { status: 400 });
    }

    await db`UPDATE applications SET status = 'ACCEPTED' WHERE id = ${id}`;
    await db`UPDATE tasks SET allocated_student_id = ${app.student_id}, status = 'IN_PROGRESS' WHERE id = ${task.id}`;

    const others = await db`SELECT * FROM applications WHERE task_id = ${task.id} AND id != ${id} AND status = 'PENDING'`;
    for (const other of others) {
      await db`UPDATE applications SET status = 'REJECTED' WHERE id = ${other.id}`;
      await notify(other.student_id, `You weren't selected for "${task.title}"`, { view: "browse-tasks" });
    }

    const gross = Number(task.remuneration);
    const net = Math.round(gross * (1 - COMMISSION_RATE) * 100) / 100;
    const [student] = await db`SELECT full_name FROM student_profiles WHERE user_id = ${app.student_id}`;
    const [contract] = await db`
      INSERT INTO contracts (task_id, sme_id, student_id, gross_remuneration, commission_rate, net_to_student, end_date, student_legal_name)
      VALUES (${task.id}, ${task.sme_id}, ${app.student_id}, ${gross}, ${COMMISSION_RATE}, ${net}, ${task.due_date}, ${student.full_name})
      RETURNING *
    `;
    await db`UPDATE tasks SET contract_id = ${contract.id} WHERE id = ${task.id}`;
    await notify(app.student_id, `You're in! Complete your employment details for "${task.title}"`, { view: "contract-flow", taskId: task.id });

    return NextResponse.json({ ok: true, contractId: contract.id });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
