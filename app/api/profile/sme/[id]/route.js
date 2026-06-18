import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapSme } from "@/lib/mappers";

export async function GET(request, { params }) {
  const { id } = params;
  const [row] = await db`SELECT * FROM sme_profiles WHERE user_id = ${id}`;
  if (!row) return NextResponse.json({ error: "Company not found." }, { status: 404 });
  return NextResponse.json({ sme: mapSme(row) });
}
