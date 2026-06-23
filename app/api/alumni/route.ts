import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  await ensureDb();
  const result = await sql`SELECT * FROM alumni ORDER BY display_order ASC, created_at DESC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const { name, type, opportunityName, university, major, year, project, quote } = await req.json();
  const id = randomUUID();
  await sql`
    INSERT INTO alumni (id, name, type, opportunity_name, university, major, year, project, quote)
    VALUES (${id}, ${name}, ${type}, ${opportunityName}, ${university || null}, ${major || null}, ${year || null}, ${project || null}, ${quote || null})
  `;
  const result = await sql`SELECT * FROM alumni WHERE id = ${id}`;
  return NextResponse.json(result.rows[0], { status: 201 });
}
