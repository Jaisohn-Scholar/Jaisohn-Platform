import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import nodemailer from "nodemailer";

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

  const appUrl = process.env.NEXTAUTH_URL || "https://jaisohn.org";
  const greeting = name ? `Dear ${name},` : "Hello,";

  const text = `${greeting}

You are receiving this email because the Philip Jaisohn Memorial Foundation would like to feature you in our Alumni Spotlight.

We would love to share your story and accomplishments with our community. Please create an account at ${appUrl} (or log in if you already have one), then visit your Profile page to submit your alumni information.

Your profile will be reviewed by our team before being published.

Thank you for being part of the Philip Jaisohn family!

Best regards,
The Philip Jaisohn Memorial Foundation`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Philip Jaisohn Memorial Foundation" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Alumni Spotlight Invitation — Philip Jaisohn Memorial Foundation",
    text,
  });

  return NextResponse.json({ success: true });
}
