import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  await ensureDb();
  const { email } = await req.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${user.id}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  await sql`UPDATE users SET email = ${email} WHERE id = ${user.id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  await ensureDb();
  await sql`DELETE FROM users WHERE id = ${user.id}`;
  return NextResponse.json({ success: true });
}
