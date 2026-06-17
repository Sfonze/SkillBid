import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { taskId } = params;
  const body = await request.json().catch(() => ({}));
  const { legalName, address, iban, taxId } = body;
  if (!legalName || !address || !iban || !taxId) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task || !task.contract_id) return NextResponse.json({ error: "No contract for this task." }, { status: 404 });
  const [contract] = await db`SELECT * FROM contracts WHERE id = ${task.contract_id}`;
  if (contract.student_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (contract.status !== "PENDING_STUDENT_INFO") return NextResponse.json({ error: "Details have already been submitted." }, { status: 400 });

  await db`
    UPDATE contracts SET student_legal_name = ${legalName}, student_address = ${address},
      student_iban = ${iban}, student_tax_id = ${taxId}, status = 'PENDING_SME_SIGNATURE'
    WHERE id = ${contract.id}
  `;
  await notify(task.sme_id, `Contract ready for your signature for "${task.title}"`, { view: "contract-flow", taskId });

  return NextResponse.json({ ok: true });
}
