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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docType: string }> }
) {
  const { id, docType } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const col = DOC_COLUMNS[docType];
  if (!col) return NextResponse.json({ error: "Invalid doc type" }, { status: 400 });

  await ensureDb();
  const user = session.user as any;
  const result = await sql`SELECT user_id, ${sql.unsafe(col)} as data FROM applications WHERE id = ${id}`;
  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = result.rows[0];
  if (user.role !== "reviewer" && row.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dataUrl: string | null = row.data;
  if (!dataUrl) return NextResponse.json({ error: "No file uploaded" }, { status: 404 });

  // Parse data URL: "data:<mime>;base64,<data>"
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Invalid file data" }, { status: 500 });

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");

  const ext = mimeType.split("/")[1] || "bin";
  const filename = `${docType}.${ext}`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
