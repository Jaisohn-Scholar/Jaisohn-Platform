import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const { name, type, opportunityName, university, major, year, project, quote, display_order } = await req.json();
  await sql`
    UPDATE alumni SET
      name = COALESCE(${name ?? null}, name),
      type = COALESCE(${type ?? null}, type),
      opportunity_name = COALESCE(${opportunityName ?? null}, opportunity_name),
      university = ${university ?? null},
      major = ${major ?? null},
      year = ${year ?? null},
      project = ${project ?? null},
      quote = ${quote ?? null},
      display_order = COALESCE(${display_order ?? null}, display_order)
    WHERE id = ${id}
  `;
  const result = await sql`SELECT * FROM alumni WHERE id = ${id}`;
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  await sql`DELETE FROM alumni WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
