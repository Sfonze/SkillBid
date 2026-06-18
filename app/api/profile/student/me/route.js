import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapStudent } from "@/lib/mappers";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const [row] = await db`SELECT * FROM student_profiles WHERE user_id = ${session.userId}`;
  return NextResponse.json({ student: mapStudent(row) });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { headline, bio, location, avatarUrl, responseTime, availableFrom, hoursPerWeek, skillLevels } = body;

  if (skillLevels && (!Array.isArray(skillLevels) || skillLevels.some((s) => !s.name || typeof s.level !== "number"))) {
    return NextResponse.json({ error: "Each skill needs a name and a level from 0-100." }, { status: 400 });
  }

  await db`
    UPDATE student_profiles SET
      headline = ${headline || null},
      bio = ${bio || null},
      location = ${location || "Maastricht, Netherlands"},
      avatar_url = ${avatarUrl || null},
      response_time = ${responseTime || null},
      available_from = ${availableFrom || null},
      hours_per_week = ${hoursPerWeek ? Number(hoursPerWeek) : null},
      skill_levels = ${JSON.stringify(skillLevels || [])}
    WHERE user_id = ${session.userId}
  `;

  const [row] = await db`SELECT * FROM student_profiles WHERE user_id = ${session.userId}`;
  return NextResponse.json({ student: mapStudent(row) });
}
