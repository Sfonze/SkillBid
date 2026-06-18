import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "SME") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { taskId } = params;

  const [task] = await db`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task || !task.contract_id) return NextResponse.json({ error: "No contract for this task." }, { status: 404 });
  const [contract] = await db`SELECT * FROM contracts WHERE id = ${task.contract_id}`;
  if (contract.sme_id !== session.userId) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (contract.status !== "PENDING_SME_SIGNATURE") return NextResponse.json({ error: "Not ready for this step." }, { status: 400 });

  await db`UPDATE contracts SET status = 'PENDING_STUDENT_SIGNATURE', signed_at_sme = now() WHERE id = ${contract.id}`;
  await notify(contract.student_id, `Company signed the contract, your turn to sign`, { view: "contract-flow", taskId });

  return NextResponse.json({ ok: true });
}
