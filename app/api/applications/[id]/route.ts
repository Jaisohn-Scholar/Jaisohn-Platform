import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getDb from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const user = session.user as any;
  const app = db.prepare(`
    SELECT a.*, u.name as user_name, u.email as user_email, o.name as opportunity_name, o.type as opportunity_type
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.id = ?
  `).get(id) as any;

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "reviewer" && app.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(app);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const user = session.user as any;
  const app = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as any;
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  if (user.role === "reviewer") {
    const { status, score, reviewNotes, essay1Score, essay2Score, essay3Score, resumeScore, transcriptScore } = body;
    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) { updates.push("status = ?"); values.push(status); }
    if (score !== undefined) { updates.push("score = ?"); values.push(score); }
    if (reviewNotes !== undefined) { updates.push("review_notes = ?"); values.push(reviewNotes); }
    if (essay1Score !== undefined) { updates.push("essay1_score = ?"); values.push(essay1Score); }
    if (essay2Score !== undefined) { updates.push("essay2_score = ?"); values.push(essay2Score); }
    if (essay3Score !== undefined) { updates.push("essay3_score = ?"); values.push(essay3Score); }
    if (resumeScore !== undefined) { updates.push("resume_score = ?"); values.push(resumeScore); }
    if (transcriptScore !== undefined) { updates.push("transcript_score = ?"); values.push(transcriptScore); }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE applications SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    return NextResponse.json({ success: true });
  }

  // Applicant update
  if (app.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { essay1, essay2, essay3, submit } = body;
  const updates: string[] = [];
  const values: any[] = [];

  if (essay1 !== undefined) { updates.push("essay1 = ?"); values.push(essay1); }
  if (essay2 !== undefined) { updates.push("essay2 = ?"); values.push(essay2); }
  if (essay3 !== undefined) { updates.push("essay3 = ?"); values.push(essay3); }
  if (submit) {
    updates.push("status = 'submitted'");
    updates.push("submitted_at = datetime('now')");
  }
  updates.push("updated_at = datetime('now')");
  values.push(id);

  if (updates.length > 0) {
    db.prepare(`UPDATE applications SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const user = session.user as any;
  const app = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as any;
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM applications WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
