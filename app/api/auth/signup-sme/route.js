import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { isPlausibleVat, isValidEmail } from "@/lib/validators";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { companyName, foundationDate, vatNumber, coreBusiness, tasksCompletedBefore, email, password } = body;

  if (!companyName || !companyName.trim()) {
    return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await db`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const verified = isPlausibleVat(vatNumber || "");

  const [user] = await db`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email.toLowerCase()}, ${passwordHash}, 'SME')
    RETURNING id, email, role
  `;
  await db`
    INSERT INTO sme_profiles (user_id, company_name, foundation_date, vat_number, core_business, tasks_completed_before, verified)
    VALUES (${user.id}, ${companyName}, ${foundationDate || null}, ${vatNumber || null}, ${coreBusiness || null}, ${Number(tasksCompletedBefore) || 0}, ${verified})
  `;

  const token = await signSessionToken({ userId: user.id, role: "SME" });
  setSessionCookie(token);

  return NextResponse.json({ id: user.id, role: "SME", name: companyName, verified });
}
