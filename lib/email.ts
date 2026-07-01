import nodemailer from "nodemailer";
import { sql } from "@/lib/db";

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function applyVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\[applicant name\]/gi, vars.applicantName ?? "")
                 .replace(/\[opportunity name\]/gi, vars.opportunityName ?? "");
}

async function getTemplate(key: string): Promise<{ subject: string; body: string } | null> {
  try {
    const result = await sql`SELECT subject, body FROM email_templates WHERE key = ${key}`;
    if (result.rows.length > 0) return result.rows[0] as { subject: string; body: string };
  } catch {
    // fall through to defaults
  }
  return null;
}

// Fallback defaults (used only if DB unavailable)
const DEFAULTS: Record<string, { subject: string; body: string }> = {
  accepted: {
    subject: "Congratulations — You've Been Accepted!",
    body: "Dear [applicant name],\n\nWe are thrilled to inform you that you have been accepted for the [opportunity name]!\n\nCongratulations on this achievement. A member of our team will be in touch shortly with next steps.\n\nWith warmest congratulations,\nThe Philip Jaisohn Memorial Foundation",
  },
  rejected: {
    subject: "Update on Your Application",
    body: "Dear [applicant name],\n\nThank you for your interest in the [opportunity name]. After careful review, we regret to inform you that we are unable to move forward with your application at this time.\n\nWe encourage you to apply again in the future.\n\nSincerely,\nThe Philip Jaisohn Memorial Foundation",
  },
  interview_requested: {
    subject: "Interview Request — Next Steps",
    body: "Dear [applicant name],\n\nThank you for applying to the [opportunity name]. We would like to invite you to an interview as the next step in our selection process.\n\nPlease reply to this email to schedule a convenient time.\n\nBest regards,\nThe Philip Jaisohn Memorial Foundation",
  },
  alumni_invite: {
    subject: "Alumni Spotlight Invitation — Philip Jaisohn Memorial Foundation",
    body: "Dear [applicant name],\n\nThe Philip Jaisohn Memorial Foundation would like to feature you in our Alumni Spotlight. Please create an account on our platform (or log in) and visit your Profile page to submit your alumni information.\n\nBest regards,\nThe Philip Jaisohn Memorial Foundation",
  },
};

interface StatusEmailParams {
  to: string;
  studentName: string;
  opportunityName: string;
  status: "accepted" | "rejected" | "interview_requested";
  reviewerEmail: string;
}

export async function sendStatusEmail(params: StatusEmailParams) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("Email not configured — skipping status email");
    return;
  }

  const template = (await getTemplate(params.status)) ?? DEFAULTS[params.status];
  const vars = { applicantName: params.studentName, opportunityName: params.opportunityName };

  await makeTransporter().sendMail({
    from: `"Philip Jaisohn Memorial Foundation" <${process.env.SMTP_USER}>`,
    to: params.to,
    cc: params.reviewerEmail,
    subject: applyVars(template.subject, vars),
    text: applyVars(template.body, vars),
  });
}

interface AlumniInviteParams {
  to: string;
  name?: string;
}

export async function sendAlumniInviteEmail(params: AlumniInviteParams) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("Email not configured — skipping alumni invite email");
    return;
  }

  const template = (await getTemplate("alumni_invite")) ?? DEFAULTS["alumni_invite"];
  const vars = { applicantName: params.name || "Alumni", opportunityName: "" };

  await makeTransporter().sendMail({
    from: `"Philip Jaisohn Memorial Foundation" <${process.env.SMTP_USER}>`,
    to: params.to,
    subject: applyVars(template.subject, vars),
    text: applyVars(template.body, vars),
  });
}
