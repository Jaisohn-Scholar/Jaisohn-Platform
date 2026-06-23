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
  const { type, name, description, award, slots, requirements, deadline } = await req.json();
  await sql`
    UPDATE opportunities SET
      type = COALESCE(${type ?? null}, type),
      name = COALESCE(${name ?? null}, name),
      description = COALESCE(${description ?? null}, description),
      award = ${award ?? null},
      slots = COALESCE(${slots ?? null}, slots),
      requirements = ${requirements ?? null},
      deadline = ${deadline ?? null}
    WHERE id = ${id}
  `;
  const result = await sql`SELECT * FROM opportunities WHERE id = ${id}`;
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  await sql`DELETE FROM opportunities WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
