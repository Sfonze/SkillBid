import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapSme } from "@/lib/mappers";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SME") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const [row] = await db`SELECT * FROM sme_profiles WHERE user_id = ${session.userId}`;
  return NextResponse.json({ sme: mapSme(row) });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== "SME") return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { bio, logoUrl, logoData, location, website, industry, companySize } = body;

  if (logoData && logoData.length > 4_000_000) {
    return NextResponse.json({ error: "Logo is too large. Please use an image under 2MB." }, { status: 400 });
  }

  await db`
    UPDATE sme_profiles SET
      bio = ${bio || null},
      logo_url = ${logoData ? null : (logoUrl || null)},
      logo_data = ${logoData || null},
      location = ${location || "Maastricht, Netherlands"},
      website = ${website || null},
      industry = ${industry || null},
      company_size = ${companySize || null}
    WHERE user_id = ${session.userId}
  `;

  const [row] = await db`SELECT * FROM sme_profiles WHERE user_id = ${session.userId}`;
  return NextResponse.json({ sme: mapSme(row) });
}
