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

export async function GET() {
  if (!await assertReviewer()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureDb();
  const result = await sql`SELECT id, name, email, created_at FROM users WHERE role = 'reviewer' ORDER BY created_at ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  if (!await assertReviewer()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureDb();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // If user already exists, promote to reviewer
  const existing = await sql`SELECT id, name, email, role FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    await sql`UPDATE users SET role = 'reviewer' WHERE email = ${email}`;
    return NextResponse.json({ ...existing.rows[0], role: "reviewer" });
  }

  // Create a placeholder account — will be activated when they sign in with Google
  const id = randomUUID();
  await sql`INSERT INTO users (id, email, name, role) VALUES (${id}, ${email}, ${email.split("@")[0]}, 'reviewer')`;
  const created = await sql`SELECT id, name, email, created_at FROM users WHERE id = ${id}`;
  return NextResponse.json(created.rows[0], { status: 201 });
}
