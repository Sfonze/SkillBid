import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapStudent } from "@/lib/mappers";

export async function GET(request, { params }) {
  const { id } = params;
  const [row] = await db`SELECT * FROM student_profiles WHERE user_id = ${id}`;
  if (!row) return NextResponse.json({ error: "Student not found." }, { status: 404 });
  return NextResponse.json({ student: mapStudent(row) });
}
