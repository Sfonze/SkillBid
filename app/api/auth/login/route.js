import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { role, email, password } = body;
  if (!role || !email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const [user] = await db`
    SELECT id, email, password_hash, role FROM users WHERE email = ${String(email).toLowerCase()} AND role = ${role.toUpperCase()}
  `;
  if (!user) {
    return NextResponse.json({ error: "No account matches that email and password for this role." }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "No account matches that email and password for this role." }, { status: 401 });
  }

  let name = "";
  if (user.role === "SME") {
    const [p] = await db`SELECT company_name FROM sme_profiles WHERE user_id = ${user.id}`;
    name = p?.company_name || "";
  } else {
    const [p] = await db`SELECT full_name FROM student_profiles WHERE user_id = ${user.id}`;
    name = p?.full_name || "";
  }

  const token = await signSessionToken({ userId: user.id, role: user.role });
  setSessionCookie(token);

  return NextResponse.json({ id: user.id, role: user.role, name });
}
