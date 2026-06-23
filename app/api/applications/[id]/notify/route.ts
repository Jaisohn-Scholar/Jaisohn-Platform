import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getDb from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();
  db.prepare("UPDATE applications SET status = 'interview_requested', updated_at = datetime('now') WHERE id = ?").run(id);

  // In production, send an email here
  return NextResponse.json({ success: true, message: "Student notified of interview request" });
}
