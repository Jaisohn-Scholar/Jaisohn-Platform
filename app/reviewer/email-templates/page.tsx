"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

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
      <div className="flex flex-col min-h-screen"><Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/reviewer" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Back to Reviewer Portal</Link>
            <h1 className="text-3xl font-bold text-[#101661]">Email Templates</h1>
            <p className="text-gray-500 text-sm mt-1">Customize the automated emails sent to applicants. Use variable blocks to personalize each message.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#b51f1f] hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save All Templates"}
          </button>
        </div>

        {/* Variable reference */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <p className="text-sm font-semibold text-[#101661] mb-2">Available Variables</p>
          <p className="text-xs text-gray-500 mb-3">Click a variable to insert it at the cursor position in the currently focused field.</p>
          <div className="flex flex-wrap gap-2">
            {VARIABLE_CHIPS.map(({ label, desc }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => insertVariable(label, "subject")}
                    className="font-mono text-xs bg-[#101661]/10 text-[#101661] border border-[#101661]/20 px-2 py-1 rounded hover:bg-[#101661]/20 transition-colors"
                    title={`Insert into subject: ${desc}`}
                  >
                    {label} → subject
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable(label, "body")}
                    className="font-mono text-xs bg-[#101661]/10 text-[#101661] border border-[#101661]/20 px-2 py-1 rounded hover:bg-[#101661]/20 transition-colors"
                    title={`Insert into body: ${desc}`}
                  >
                    {label} → body
                  </button>
                </div>
                <span className="text-xs text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar tabs */}
          <div className="space-y-2">
            {TEMPLATE_META.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveKey(m.key)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  activeKey === m.key
                    ? "bg-[#101661] text-white border-[#101661] shadow-sm font-semibold"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#101661]"
                }`}
              >
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-1 ${activeKey === m.key ? "bg-white/20 text-white border-white/30" : m.color}`}>
                  {m.label}
                </span>
                <p className={`text-xs mt-0.5 ${activeKey === m.key ? "text-blue-200" : "text-gray-400"}`}>{m.description}</p>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
              <span className="text-sm text-gray-400">{meta.description}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input
                id="field-subject"
                type="text"
                value={active.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
                placeholder="Email subject..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
              <textarea
                id="field-body"
                rows={14}
                value={active.body}
                onChange={(e) => update("body", e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y"
                placeholder="Email body text..."
              />
            </div>

            {/* Preview */}
            {(active.body.includes("[applicant name]") || active.body.includes("[opportunity name]") ||
              active.subject.includes("[applicant name]") || active.subject.includes("[opportunity name]")) && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview (example values)</p>
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Subject:</span>{" "}
                  {active.subject
                    .replace(/\[applicant name\]/gi, "Jane Doe")
                    .replace(/\[opportunity name\]/gi, "Jaisohn Challenge Scholarship")}
                </p>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">
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
