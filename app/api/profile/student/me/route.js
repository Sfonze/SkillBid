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
  const { headline, bio, location, avatarUrl, avatarData, responseTime, availableFrom, hoursPerWeek, skillLevels, degree } = body;

  if (skillLevels && (!Array.isArray(skillLevels) || skillLevels.some((s) => !s.name || typeof s.level !== "number"))) {
    return NextResponse.json({ error: "Each skill needs a name and a level from 0-100." }, { status: 400 });
  }

  // Validate base64 image size (max ~3MB base64 = ~2.2MB actual)
  if (avatarData && avatarData.length > 4_000_000) {
    return NextResponse.json({ error: "Photo is too large. Please use an image under 2MB." }, { status: 400 });
  }

  await db`
    UPDATE student_profiles SET
      headline = ${headline || null},
      bio = ${bio || null},
      location = ${location || "Maastricht, Netherlands"},
      avatar_url = ${avatarData ? null : (avatarUrl || null)},
      avatar_data = ${avatarData || null},
      response_time = ${responseTime || null},
      available_from = ${availableFrom || null},
      hours_per_week = ${hoursPerWeek ? Number(hoursPerWeek) : null},
      skill_levels = ${JSON.stringify(skillLevels || [])},
      degree = ${degree || null}
    WHERE user_id = ${session.userId}
  `;

  const [row] = await db`SELECT * FROM student_profiles WHERE user_id = ${session.userId}`;
  return NextResponse.json({ student: mapStudent(row) });
}
