import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const { commentId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  // Reviewers can only delete their own comments
  const result = await sql`SELECT reviewer_id FROM application_comments WHERE id = ${commentId}`;
  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (result.rows[0].reviewer_id !== user.id) return NextResponse.json({ error: "Can only delete your own comments" }, { status: 403 });

  await sql`DELETE FROM application_comments WHERE id = ${commentId}`;
  return NextResponse.json({ success: true });
}
