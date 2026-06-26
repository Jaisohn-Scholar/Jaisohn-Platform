import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { randomUUID } from "crypto";

async function assertReviewer() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as any;
  if (user.role !== "reviewer") return null;
  return user;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await assertReviewer()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureDb();
  const result = await sql`
    SELECT * FROM application_comments WHERE application_id = ${id} ORDER BY created_at ASC
  `;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await assertReviewer();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureDb();

  const { comment } = await req.json();
  if (!comment?.trim()) return NextResponse.json({ error: "Comment required" }, { status: 400 });

  const commentId = randomUUID();
  await sql`
    INSERT INTO application_comments (id, application_id, reviewer_id, reviewer_name, reviewer_email, comment)
    VALUES (${commentId}, ${id}, ${user.id}, ${user.name || user.email}, ${user.email}, ${comment.trim()})
  `;
  const result = await sql`SELECT * FROM application_comments WHERE id = ${commentId}`;
  return NextResponse.json(result.rows[0], { status: 201 });
}
