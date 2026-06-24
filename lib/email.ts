import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface StatusEmailParams {
  to: string;
  studentName: string;
  opportunityName: string;
  status: "accepted" | "rejected" | "interview_requested";
  reviewerEmail: string;
}

const SUBJECT: Record<string, string> = {
  accepted: "Congratulations — You've Been Accepted!",
  rejected: "Update on Your Application",
  interview_requested: "Interview Request — Next Steps",
};

function buildBody(params: StatusEmailParams): string {
  const { studentName, opportunityName, status, reviewerEmail } = params;
  const foundation = "Philip Jaisohn Memorial Foundation";

  if (status === "accepted") {
    return `
Dear ${studentName},

We are thrilled to inform you that you have been accepted for the ${opportunityName}!

Congratulations on this achievement. A member of our team will be in touch shortly with next steps and any additional information you may need.

If you have any questions in the meantime, please feel free to reply to this email or contact us at ${reviewerEmail}.

With warmest congratulations,
The ${foundation}
    `.trim();
  }

  if (status === "interview_requested") {
    return `
Dear ${studentName},

Thank you for applying to the ${opportunityName}. We have reviewed your application and would like to invite you to an interview as the next step in our selection process.

Please reply to this email to schedule a convenient time, or reach out directly to ${reviewerEmail}.

We look forward to speaking with you!

Best regards,
The ${foundation}
    `.trim();
  }

  // rejected
  return `
Dear ${studentName},

Thank you for your interest in the ${opportunityName} and for taking the time to submit your application.

After careful review, we regret to inform you that we are unable to move forward with your application at this time. This was a competitive process and we encourage you to apply again in the future.

We appreciate your dedication and wish you all the best in your academic and professional journey.

Sincerely,
The ${foundation}
  `.trim();
}

export async function sendStatusEmail(params: StatusEmailParams) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("Email not configured — skipping status email");
    return;
  }

  const subject = SUBJECT[params.status];
  const text = buildBody(params);

  await transporter.sendMail({
    from: `"Philip Jaisohn Memorial Foundation" <${process.env.SMTP_USER}>`,
    to: params.to,
    cc: params.reviewerEmail,
    subject,
    text,
  });
}
