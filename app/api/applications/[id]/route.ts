import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;
  const result = await sql`
    SELECT a.*, u.name as user_name, u.email as user_email, o.name as opportunity_name, o.type as opportunity_type
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.id = ${id}
  `;
  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const app = result.rows[0];
  if (user.role !== "reviewer" && app.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(app);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;
  const appResult = await sql`SELECT * FROM applications WHERE id = ${id}`;
  if (appResult.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const app = appResult.rows[0];

  const body = await req.json();

  if (user.role === "reviewer") {
    const { status, score, reviewNotes, essay1Score, essay2Score, essay3Score, resumeScore, transcriptScore } = body;
    await sql`
      UPDATE applications SET
        status = COALESCE(${status ?? null}, status),
        score = COALESCE(${score ?? null}::integer, score),
        review_notes = COALESCE(${reviewNotes ?? null}, review_notes),
        essay1_score = COALESCE(${essay1Score ?? null}::integer, essay1_score),
        essay2_score = COALESCE(${essay2Score ?? null}::integer, essay2_score),
        essay3_score = COALESCE(${essay3Score ?? null}::integer, essay3_score),
        resume_score = COALESCE(${resumeScore ?? null}::integer, resume_score),
        transcript_score = COALESCE(${transcriptScore ?? null}::integer, transcript_score),
        updated_at = NOW()
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  }

  if (app.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { essay1, essay2, essay3, submit } = body;
  if (submit) {
    await sql`
      UPDATE applications SET
        essay1 = COALESCE(${essay1 ?? null}, essay1),
        essay2 = COALESCE(${essay2 ?? null}, essay2),
        essay3 = COALESCE(${essay3 ?? null}, essay3),
        status = 'submitted',
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE applications SET
        essay1 = COALESCE(${essay1 ?? null}, essay1),
        essay2 = COALESCE(${essay2 ?? null}, essay2),
        essay3 = COALESCE(${essay3 ?? null}, essay3),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;
  const appResult = await sql`SELECT * FROM applications WHERE id = ${id}`;
  if (appResult.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (appResult.rows[0].user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sql`DELETE FROM applications WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
