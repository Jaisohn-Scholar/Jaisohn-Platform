import { NextResponse } from "next/server";
import { sql, ensureDb } from "@/lib/db";

export async function GET() {
  await ensureDb();
  const result = await sql`SELECT * FROM opportunities ORDER BY type, name`;
  return NextResponse.json(result.rows);
}
