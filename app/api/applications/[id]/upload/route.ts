import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getDb from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const db = getDb();
  const app = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as any;
  if (!app || app.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const fileType = formData.get("type") as string; // "resume" | "transcript"

  if (!file || !fileType) return NextResponse.json({ error: "Missing file or type" }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads", id);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop();
  const filename = `${fileType}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const dbField = fileType === "resume" ? "resume_path" : "transcript_path";
  const publicPath = `/uploads/${id}/${filename}`;
  db.prepare(`UPDATE applications SET ${dbField} = ?, updated_at = datetime('now') WHERE id = ?`).run(publicPath, id);

  return NextResponse.json({ path: publicPath });
}
