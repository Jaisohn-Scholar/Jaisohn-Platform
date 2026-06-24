import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { sendStatusEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const result = await sql`
    SELECT a.status, u.name as user_name, u.email as user_email, o.name as opportunity_name
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.id = ${id}
  `;
  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const app = result.rows[0];

  await sql`UPDATE applications SET status = 'interview_requested', updated_at = NOW() WHERE id = ${id}`;

  await sendStatusEmail({
    to: app.user_email,
    studentName: app.user_name,
    opportunityName: app.opportunity_name,
    status: "interview_requested",
    reviewerEmail: user.email,
  });

  return NextResponse.json({ success: true });
}
