import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const opportunities = db.prepare("SELECT * FROM opportunities ORDER BY type, name").all();
  return NextResponse.json(opportunities);
}
