import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapNotification } from "@/lib/mappers";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const rows = await db`SELECT * FROM notifications WHERE user_id = ${session.userId} ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json({ notifications: rows.map(mapNotification) });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await db`UPDATE notifications SET read = true WHERE user_id = ${session.userId} AND read = false`;
  return NextResponse.json({ ok: true });
}
