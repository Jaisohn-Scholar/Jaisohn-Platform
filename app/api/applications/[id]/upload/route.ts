import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql, ensureDb } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

  const uploadDir = path.join(process.cwd(), "public", "uploads", id);
  await mkdir(uploadDir, { recursive: true });
  const ext = file.name.split(".").pop();
  const filename = `${fileType}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const publicPath = `/uploads/${id}/${filename}`;
  if (fileType === "resume") {
    await sql`UPDATE applications SET resume_path = ${publicPath}, updated_at = NOW() WHERE id = ${id}`;
  } else {
    await sql`UPDATE applications SET transcript_path = ${publicPath}, updated_at = NOW() WHERE id = ${id}`;
  }
  return NextResponse.json({ path: publicPath });
}
