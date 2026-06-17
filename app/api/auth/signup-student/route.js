import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";
import { isUniEmail, isValidEmail } from "@/lib/validators";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { fullName, universityEmail, university, languages, skills, password } = body;

  if (!fullName || !fullName.trim()) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!isValidEmail(universityEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!Array.isArray(languages) || languages.length === 0) {
    return NextResponse.json({ error: "Pick at least one language." }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await db`SELECT id FROM users WHERE email = ${universityEmail.toLowerCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const verified = isUniEmail(universityEmail);
  const skillsArr = Array.isArray(skills) ? skills : String(skills || "").split(",").map((s) => s.trim()).filter(Boolean);

  const [user] = await db`
    INSERT INTO users (email, password_hash, role)
    VALUES (${universityEmail.toLowerCase()}, ${passwordHash}, 'STUDENT')
    RETURNING id, email, role
  `;
  await db`
    INSERT INTO student_profiles (user_id, full_name, university, university_email, languages, skills, verified)
    VALUES (${user.id}, ${fullName}, ${university || null}, ${universityEmail}, ${languages}, ${skillsArr}, ${verified})
  `;

  const token = await signSessionToken({ userId: user.id, role: "STUDENT" });
  setSessionCookie(token);

  return NextResponse.json({ id: user.id, role: "STUDENT", name: fullName, verified });
}
