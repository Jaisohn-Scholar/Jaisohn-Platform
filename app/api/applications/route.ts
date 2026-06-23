import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getDb from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const user = session.user as any;

  if (user.role === "reviewer") {
    const apps = db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email, o.name as opportunity_name, o.type as opportunity_type
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.created_at DESC
    `).all();
    return NextResponse.json(apps);
  }

  const apps = db.prepare(`
    SELECT a.*, o.name as opportunity_name, o.type as opportunity_type
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(user.id);
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { opportunityId } = body;

  const db = getDb();
  const opp = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(opportunityId) as any;
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  // Check for existing application of same type
  const existing = db.prepare(`
    SELECT a.id FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ? AND o.type = ?
  `).get(user.id, opp.type);

  if (existing) {
    return NextResponse.json(
      { error: `You already have a ${opp.type} application. You can only have 1 internship and 1 scholarship application.` },
      { status: 400 }
    );
  }

  const id = randomUUID();
  db.prepare("INSERT INTO applications (id, user_id, opportunity_id, status) VALUES (?, ?, ?, 'in_progress')").run(
    id, user.id, opportunityId
  );

  return NextResponse.json({ id });
}
