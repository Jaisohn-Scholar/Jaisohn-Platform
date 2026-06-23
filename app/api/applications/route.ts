import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;

  if (user.role === "reviewer") {
    const result = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email, o.name as opportunity_name, o.type as opportunity_type
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.created_at DESC
    `;
    return NextResponse.json(result.rows);
  }

  const result = await sql`
    SELECT a.*, o.name as opportunity_name, o.type as opportunity_type
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ${user.id}
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;
  const body = await req.json();
  const { opportunityId } = body;

  const oppResult = await sql`SELECT * FROM opportunities WHERE id = ${opportunityId}`;
  if (oppResult.rows.length === 0) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  const opp = oppResult.rows[0];

  const existing = await sql`
    SELECT a.id FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ${user.id} AND o.type = ${opp.type}
  `;
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: `You already have a ${opp.type} application. You can only have 1 internship and 1 scholarship application.` },
      { status: 400 }
    );
  }

  const id = randomUUID();
  await sql`INSERT INTO applications (id, user_id, opportunity_id, status) VALUES (${id}, ${user.id}, ${opportunityId}, 'in_progress')`;
  return NextResponse.json({ id });
}
