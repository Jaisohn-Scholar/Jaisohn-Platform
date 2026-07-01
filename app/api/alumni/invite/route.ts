import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { sendAlumniInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "reviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDb();
  const { email, name } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXTAUTH_URL || "";
  await sendAlumniInviteEmail({ to: email, name, appUrl });

  return NextResponse.json({ success: true });
}
