import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapStudent } from "@/lib/mappers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  const rows = await db`SELECT * FROM student_profiles ORDER BY rating DESC NULLS LAST, completed_tasks_count DESC`;
  return NextResponse.json({ students: rows.map(mapStudent) }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
}
