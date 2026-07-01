import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";

type DocType = "resume" | "transcript" | "cover_letter" | "rec_letter" | "financial_need" | "supporting_docs";

const VALID_DOC_TYPES = new Set<string>(["resume", "transcript", "cover_letter", "rec_letter", "financial_need", "supporting_docs"]);

async function fetchDocData(id: string, docType: DocType) {
  switch (docType) {
    case "resume":
      return sql`SELECT user_id, resume_path as data FROM applications WHERE id = ${id}`;
    case "transcript":
      return sql`SELECT user_id, transcript_path as data FROM applications WHERE id = ${id}`;
    case "cover_letter":
      return sql`SELECT user_id, cover_letter_path as data FROM applications WHERE id = ${id}`;
    case "rec_letter":
      return sql`SELECT user_id, rec_letter_path as data FROM applications WHERE id = ${id}`;
    case "financial_need":
      return sql`SELECT user_id, financial_need_path as data FROM applications WHERE id = ${id}`;
    case "supporting_docs":
      return sql`SELECT user_id, supporting_docs_path as data FROM applications WHERE id = ${id}`;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docType: string }> }
) {
  const { id, docType } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!VALID_DOC_TYPES.has(docType)) {
    return NextResponse.json({ error: "Invalid doc type" }, { status: 400 });
  }

  await ensureDb();
  const user = session.user as any;
  const result = await fetchDocData(id, docType as DocType);
  if (!result || result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = result.rows[0];
  if (user.role !== "reviewer" && row.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dataUrl: string | null = row.data;
  if (!dataUrl) return NextResponse.json({ error: "No file uploaded" }, { status: 404 });

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Invalid file data" }, { status: 500 });

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");
  const ext = mimeType.split("/")[1] || "bin";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${docType}.${ext}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
