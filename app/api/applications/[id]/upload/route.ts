import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

const DOC_COLUMNS: Record<string, string> = {
  resume: "resume_path",
  transcript: "transcript_path",
  cover_letter: "cover_letter_path",
  rec_letter: "rec_letter_path",
  financial_need: "financial_need_path",
  supporting_docs: "supporting_docs_path",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDb();
  const user = session.user as any;
  const appResult = await sql`SELECT * FROM applications WHERE id = ${id}`;
  if (appResult.rows.length === 0 || appResult.rows[0].user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileType = formData.get("type") as string;
  if (!file || !fileType) return NextResponse.json({ error: "Missing file or type" }, { status: 400 });

  const col = DOC_COLUMNS[fileType];
  if (!col) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "application/pdf";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  // Safe because col comes from our own allowlist above
  if (col === "resume_path") await sql`UPDATE applications SET resume_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;
  else if (col === "transcript_path") await sql`UPDATE applications SET transcript_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;
  else if (col === "cover_letter_path") await sql`UPDATE applications SET cover_letter_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;
  else if (col === "rec_letter_path") await sql`UPDATE applications SET rec_letter_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;
  else if (col === "financial_need_path") await sql`UPDATE applications SET financial_need_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;
  else if (col === "supporting_docs_path") await sql`UPDATE applications SET supporting_docs_path = ${dataUrl}, updated_at = NOW() WHERE id = ${id}`;

  return NextResponse.json({ path: dataUrl, type: fileType });
}
