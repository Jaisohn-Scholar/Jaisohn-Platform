import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  await ensureDb();
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  // Reviewers see all; public sees only published
  if (user?.role === "reviewer") {
    const result = await sql`SELECT * FROM alumni ORDER BY display_order ASC, created_at DESC`;
    return NextResponse.json(result.rows);
  }
  const result = await sql`SELECT * FROM alumni WHERE published = true ORDER BY display_order ASC, created_at DESC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  await ensureDb();
  const { name, type, opportunityName, university, major, year, project, quote } = await req.json();
  const id = randomUUID();

  if (user.role === "reviewer") {
    // Reviewer-added alumni are published immediately
    await sql`
      INSERT INTO alumni (id, name, type, opportunity_name, university, major, year, project, quote, published)
      VALUES (${id}, ${name}, ${type}, ${opportunityName}, ${university || null}, ${major || null}, ${year || null}, ${project || null}, ${quote || null}, true)
    `;
  } else {
    // Applicant-submitted alumni profiles start unpublished
    await sql`
      INSERT INTO alumni (id, name, type, opportunity_name, university, major, year, project, quote, published, user_id)
      VALUES (${id}, ${name}, ${type}, ${opportunityName}, ${university || null}, ${major || null}, ${year || null}, ${project || null}, ${quote || null}, false, ${user.dbId || user.id || null})
    `;
  }

  const result = await sql`SELECT * FROM alumni WHERE id = ${id}`;
  return NextResponse.json(result.rows[0], { status: 201 });
}
