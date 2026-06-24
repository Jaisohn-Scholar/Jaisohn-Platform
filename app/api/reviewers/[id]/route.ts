import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent removing yourself
  if (user.id === id) return NextResponse.json({ error: "Cannot remove your own account" }, { status: 400 });

  await ensureDb();
  // Demote to applicant rather than deleting (preserves any existing data)
  await sql`UPDATE users SET role = 'applicant' WHERE id = ${id} AND role = 'reviewer'`;
  return NextResponse.json({ success: true });
}
