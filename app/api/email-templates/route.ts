import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

const VALID_KEYS = new Set(["accepted", "rejected", "interview_requested", "alumni_invite"]);

export async function GET() {
  await ensureDb();
  const result = await sql`SELECT key, subject, body FROM email_templates ORDER BY key`;
  const map: Record<string, { subject: string; body: string }> = {};
  for (const row of result.rows) {
    map[row.key] = { subject: row.subject, body: row.body };
  }
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const updates: Record<string, { subject: string; body: string }> = await req.json();

  for (const [key, { subject, body }] of Object.entries(updates)) {
    if (!VALID_KEYS.has(key)) continue;
    await sql`
      INSERT INTO email_templates (key, subject, body, updated_at)
      VALUES (${key}, ${subject}, ${body}, NOW())
      ON CONFLICT (key) DO UPDATE SET subject = ${subject}, body = ${body}, updated_at = NOW()
    `;
  }

  return NextResponse.json({ success: true });
}
