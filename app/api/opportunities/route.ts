import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  await ensureDb();
  const result = await sql`SELECT * FROM opportunities ORDER BY type, name`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const { type, name, description, award, slots, requirements, deadline } = await req.json();
  const id = randomUUID();
  await sql`
    INSERT INTO opportunities (id, type, name, description, award, slots, requirements, deadline)
    VALUES (${id}, ${type}, ${name}, ${description}, ${award || null}, ${slots || 1}, ${requirements || null}, ${deadline || null})
  `;
  const result = await sql`SELECT * FROM opportunities WHERE id = ${id}`;
  return NextResponse.json(result.rows[0], { status: 201 });
}
