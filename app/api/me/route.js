import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  if (session.role === "SME") {
    const [p] = await db`
      SELECT u.id, u.email, p.company_name, p.foundation_date, p.vat_number, p.core_business, p.tasks_completed_before, p.verified
      FROM users u JOIN sme_profiles p ON p.user_id = u.id WHERE u.id = ${session.userId}
    `;
    if (!p) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        id: p.id, role: "SME", email: p.email, name: p.company_name,
        companyName: p.company_name, foundationDate: p.foundation_date, vatNumber: p.vat_number,
        coreBusiness: p.core_business, tasksCompletedBefore: p.tasks_completed_before, verified: p.verified,
      },
    });
  } else {
    const [p] = await db`
      SELECT u.id, u.email, p.full_name, p.university, p.university_email, p.languages, p.skills, p.completed_tasks_count, p.rating, p.verified
      FROM users u JOIN student_profiles p ON p.user_id = u.id WHERE u.id = ${session.userId}
    `;
    if (!p) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        id: p.id, role: "STUDENT", email: p.email, name: p.full_name,
        fullName: p.full_name, university: p.university, universityEmail: p.university_email,
        languages: p.languages, skills: p.skills, completedTasksCount: p.completed_tasks_count,
        rating: p.rating !== null ? Number(p.rating) : null, verified: p.verified,
      },
    });
  }
}
