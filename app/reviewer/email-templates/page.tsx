"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

import { reviewerEmailTemplatesPageStyles } from "@/styles/pages/reviewer-email-templates";
type TemplateKey = "accepted" | "rejected" | "interview_requested" | "alumni_invite";

interface Template {
  subject: string;
  body: string;
}

const TEMPLATE_META: { key: TemplateKey; label: string; description: string; color: string }[] = [
  {
    key: "accepted",
    label: "Accepted",
    description: "Sent when an applicant is accepted.",
    color: "text-green-700 bg-green-50 border-green-200",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Sent when an application is rejected.",
    color: "text-red-700 bg-red-50 border-red-200",
  },
  {
    key: "interview_requested",
    label: "Interview Requested",
    description: "Sent when an interview is requested.",
    color: "text-orange-700 bg-orange-50 border-orange-200",
  },
  {
    key: "alumni_invite",
    label: "Alumni Invite",
    description: "Sent when a reviewer invites a former alumni to submit their profile.",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
];

const VARIABLE_CHIPS = [
  { label: "[applicant name]", desc: "The applicant's full name" },
  { label: "[opportunity name]", desc: "The scholarship or internship name" },
];

export default function EmailTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Record<TemplateKey, Template>>({
    accepted: { subject: "", body: "" },
    rejected: { subject: "", body: "" },
    interview_requested: { subject: "", body: "" },
    alumni_invite: { subject: "", body: "" },
  });
  const [activeKey, setActiveKey] = useState<TemplateKey>("accepted");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      load();
    }
  }, [status]);

  async function load() {
    const res = await fetch("/api/email-templates");
    const data = await res.json();
    setTemplates((prev) => ({ ...prev, ...data }));
    setLoading(false);
  }

  function update(field: "subject" | "body", value: string) {
    setTemplates((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [field]: value },
    }));
    setSaved(false);
  }

  function insertVariable(variable: string, field: "subject" | "body") {
    const textarea = document.getElementById(`field-${field}`) as HTMLTextAreaElement | HTMLInputElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const current = templates[activeKey][field];
    const next = current.slice(0, start) + variable + current.slice(end);
    update(field, next);
    setTimeout(() => {
      textarea.focus();
      const pos = start + variable.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/email-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templates),
    });
    setSaving(false);
    setSaved(true);
  }

  const active = templates[activeKey];
  const meta = TEMPLATE_META.find((m) => m.key === activeKey)!;

  if (loading) {
    return (
      <div className={reviewerEmailTemplatesPageStyles.flex01}><Navbar />
        <div className={reviewerEmailTemplatesPageStyles.flextext02}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={reviewerEmailTemplatesPageStyles.flex03}>
      <Navbar />
      <div className={reviewerEmailTemplatesPageStyles.className04}>
        <div className={reviewerEmailTemplatesPageStyles.flex05}>
          <div>
            <Link href="/reviewer" className={reviewerEmailTemplatesPageStyles.text06}>← Back to Reviewer Portal</Link>
            <h1 className={reviewerEmailTemplatesPageStyles.text07}>Email Templates</h1>
            <p className={reviewerEmailTemplatesPageStyles.text08}>Customize the automated emails sent to applicants. Use variable blocks to personalize each message.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={reviewerEmailTemplatesPageStyles.text09}
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save All Templates"}
          </button>
        </div>

        {/* Variable reference */}
        <div className={reviewerEmailTemplatesPageStyles.white10}>
          <p className={reviewerEmailTemplatesPageStyles.text11}>Available Variables</p>
          <p className={reviewerEmailTemplatesPageStyles.text12}>Click a variable to insert it at the cursor position in the currently focused field.</p>
          <div className={reviewerEmailTemplatesPageStyles.flex13}>
            {VARIABLE_CHIPS.map(({ label, desc }) => (
              <div key={label} className={reviewerEmailTemplatesPageStyles.flex14}>
                <div className={reviewerEmailTemplatesPageStyles.flex15}>
                  <button
                    type="button"
                    onClick={() => insertVariable(label, "subject")}
                    className={reviewerEmailTemplatesPageStyles.text16}
                    title={`Insert into subject: ${desc}`}
                  >
                    {label} → subject
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable(label, "body")}
                    className={reviewerEmailTemplatesPageStyles.text16}
                    title={`Insert into body: ${desc}`}
                  >
                    {label} → body
                  </button>
                </div>
                <span className={reviewerEmailTemplatesPageStyles.text17}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={reviewerEmailTemplatesPageStyles.grid18}>
          {/* Sidebar tabs */}
          <div className={reviewerEmailTemplatesPageStyles.className19}>
            {TEMPLATE_META.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveKey(m.key)}
                className={`${reviewerEmailTemplatesPageStyles.templateTab} ${activeKey === m.key ? reviewerEmailTemplatesPageStyles.templateTabActive : reviewerEmailTemplatesPageStyles.templateTabInactive}`}
              >
                <span className={`${reviewerEmailTemplatesPageStyles.templateBadge} ${activeKey === m.key ? reviewerEmailTemplatesPageStyles.templateBadgeActive : m.color}`}>
                  {m.label}
                </span>
                <p className={`${reviewerEmailTemplatesPageStyles.templateDescription} ${activeKey === m.key ? reviewerEmailTemplatesPageStyles.templateDescriptionActive : reviewerEmailTemplatesPageStyles.templateDescriptionInactive}`}>{m.description}</p>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className={reviewerEmailTemplatesPageStyles.white20}>
            <div className={reviewerEmailTemplatesPageStyles.flex21}>
              <span className={`${reviewerEmailTemplatesPageStyles.metaBadge} ${meta.color}`}>{meta.label}</span>
              <span className={reviewerEmailTemplatesPageStyles.text22}>{meta.description}</span>
            </div>

            <div>
              <label className={reviewerEmailTemplatesPageStyles.text23}>Subject Line</label>
              <input
                id="field-subject"
                type="text"
                value={active.subject}
                onChange={(e) => update("subject", e.target.value)}
                className={reviewerEmailTemplatesPageStyles.text24}
                placeholder="Email subject..."
              />
            </div>

            <div>
              <label className={reviewerEmailTemplatesPageStyles.text23}>Email Body</label>
              <textarea
                id="field-body"
                rows={14}
                value={active.body}
                onChange={(e) => update("body", e.target.value)}
                className={reviewerEmailTemplatesPageStyles.text25}
                placeholder="Email body text..."
              />
            </div>

            {/* Preview */}
            {(active.body.includes("[applicant name]") || active.body.includes("[opportunity name]") ||
              active.subject.includes("[applicant name]") || active.subject.includes("[opportunity name]")) && (
              <div className={reviewerEmailTemplatesPageStyles.className26}>
                <p className={reviewerEmailTemplatesPageStyles.text27}>Preview (example values)</p>
                <p className={reviewerEmailTemplatesPageStyles.text28}>
                  <span className={reviewerEmailTemplatesPageStyles.className29}>Subject:</span>{" "}
                  {active.subject
                    .replace(/\[applicant name\]/gi, "Jane Doe")
                    .replace(/\[opportunity name\]/gi, "Jaisohn Challenge Scholarship")}
                </p>
                <pre className={reviewerEmailTemplatesPageStyles.text30}>
                  {active.body
                    .replace(/\[applicant name\]/gi, "Jane Doe")
                    .replace(/\[opportunity name\]/gi, "Jaisohn Challenge Scholarship")}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
