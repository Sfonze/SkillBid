import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapSme, mapStudent } from "@/lib/mappers";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  if (session.role === "SME") {
    const [row] = await db`
      SELECT u.id AS uid, u.email, p.* FROM users u JOIN sme_profiles p ON p.user_id = u.id WHERE u.id = ${session.userId}
    `;
    if (!row) return NextResponse.json({ user: null });
    const sme = mapSme(row);
    return NextResponse.json({ user: { ...sme, role: "SME", email: row.email, name: sme.companyName } });
  } else {
    const [row] = await db`
      SELECT u.id AS uid, u.email, p.* FROM users u JOIN student_profiles p ON p.user_id = u.id WHERE u.id = ${session.userId}
    `;
    if (!row) return NextResponse.json({ user: null });
    const student = mapStudent(row);
    return NextResponse.json({ user: { ...student, role: "STUDENT", email: row.email, name: student.fullName } });
  }
}
