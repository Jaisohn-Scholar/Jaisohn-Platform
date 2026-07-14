"use client";
import { use, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface Application {
  id: string;
  opportunity_name: string;
  opportunity_type: string;
  status: string;
  essay1: string | null;
  essay2: string | null;
  essay3: string | null;
  essay1_prompt: string | null;
  essay2_prompt: string | null;
  essay3_prompt: string | null;
  resume_path: string | null;
  transcript_path: string | null;
  cover_letter_path: string | null;
  rec_letter_path: string | null;
  financial_need_path: string | null;
  supporting_docs_path: string | null;
  applicant_school: string | null;
  applicant_year: string | null;
  applicant_birthday: string | null;
  required_fields: string[];
  required_docs: string[];
  user_name: string;
  user_email: string;
}

const DOC_LABELS: Record<string, string> = {
  resume: "Resume",
  transcript: "Academic Transcript",
  cover_letter: "Cover Letter",
  rec_letter: "Letter of Recommendation",
  financial_need: "Proof of Financial Need",
  supporting_docs: "Supporting Documents",
};

const DOC_PATH_KEYS: Record<string, keyof Application> = {
  resume: "resume_path",
  transcript: "transcript_path",
  cover_letter: "cover_letter_path",
  rec_letter: "rec_letter_path",
  financial_need: "financial_need_path",
  supporting_docs: "supporting_docs_path",
};

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [essay1, setEssay1] = useState("");
  const [essay2, setEssay2] = useState("");
  const [essay3, setEssay3] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [birthday, setBirthday] = useState("");
  const [docPaths, setDocPaths] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") loadApp();
  }, [status]);

  async function loadApp() {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) { router.push("/portal"); return; }
    const data = await res.json();
    setApp(data);
    setEssay1(data.essay1 || "");
    setEssay2(data.essay2 || "");
    setEssay3(data.essay3 || "");
    setSchool(data.applicant_school || "");
    setYear(data.applicant_year || "");
    setBirthday(data.applicant_birthday || "");
    const paths: Record<string, string | null> = {};
    for (const key of Object.keys(DOC_PATH_KEYS)) {
      paths[key] = data[DOC_PATH_KEYS[key]] as string | null;
    }
    setDocPaths(paths);
  }

  function triggerAutoSave() {
    clearTimeout(autoSaveTimer.current);
    setSaved(false);
    autoSaveTimer.current = setTimeout(() => save(), 3000);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essay1, essay2, essay3, applicant_school: school, applicant_year: year, applicant_birthday: birthday }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function submit() {
    setSaving(true);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essay1, essay2, essay3, applicant_school: school, applicant_year: year, applicant_birthday: birthday, submit: true }),
    });
    setSaving(false);
    setSubmitConfirm(false);
    router.push("/portal");
  }

  async function uploadFile(file: File, type: string) {
    setUploadError("");
    const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
    if (!extension || !["pdf", "doc", "docx"].includes(extension)) {
      setUploadError("Only PDF or Word files (.pdf, .doc, .docx) are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("The selected file is larger than 10 MB.");
      return;
    }

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/applications/${id}/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setDocPaths(prev => ({ ...prev, [type]: data.path }));
    } else {
      setUploadError(data.error || "Upload failed. Please try again.");
    }
    setUploading(null);
  }

  if (!app) return (
    <div className="flex flex-col min-h-screen"><Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
    </div>
  );

  const isReadOnly = app.status !== "in_progress";
  const rf = app.required_fields || [];
  const rd = app.required_docs || [];

  const needsSchool = rf.includes("school");
  const needsYear = rf.includes("year");
  const needsBirthday = rf.includes("birthday");
  const hasPersonalSection = needsSchool || needsYear || needsBirthday;

  const essays = [
    { enabled: !!app.essay1_prompt, prompt: app.essay1_prompt, value: essay1, set: setEssay1 },
    { enabled: !!app.essay2_prompt, prompt: app.essay2_prompt, value: essay2, set: setEssay2 },
    { enabled: !!app.essay3_prompt, prompt: app.essay3_prompt, value: essay3, set: setEssay3 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-6">
          <Link href="/portal" className="text-sm text-[#101661] hover:underline">← Back to My Applications</Link>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${app.opportunity_type === "scholarship" ? "bg-blue-50 text-[#101661] border-blue-200" : "bg-purple-50 text-purple-800 border-purple-200"}`}>
              {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101661] mt-2">{app.opportunity_name}</h1>
          {isReadOnly && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md px-4 py-2 text-blue-700 text-sm">
              This application has been submitted and is read-only.
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400">
              {saving ? "Saving..." : saved ? "✓ Saved" : "Changes are autosaved"}
            </span>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving}
                className="text-sm bg-white border border-gray-300 hover:border-[#101661] text-gray-700 px-4 py-1.5 rounded-md transition-colors">
                Save Draft
              </button>
              <button onClick={() => setSubmitConfirm(true)}
                className="text-sm bg-[#b51f1f] hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition-colors font-medium">
                Submit Application
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Applicant Info — always show name/email, plus optional fields */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {rf.includes("name") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.user_name}</p>
                </div>
              )}
              {rf.includes("email") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.user_email}</p>
                </div>
              )}
              {needsSchool && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">School / University</label>
                  <input value={school} onChange={e => { setSchool(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly} placeholder="e.g. University of Pennsylvania"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              )}
              {needsYear && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Year / Grade Level</label>
                  <input value={year} onChange={e => { setYear(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly} placeholder="e.g. Junior, 3rd Year"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              )}
              {needsBirthday && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                  <input type="date" value={birthday} onChange={e => { setBirthday(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Essays */}
          {essays.map((essay, i) => essay.enabled && (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-[#101661] mb-1">Essay Question {i + 1}</h2>
              <p className="text-gray-500 text-sm mb-3">{essay.prompt}</p>
              <textarea value={essay.value}
                onChange={e => { essay.set(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                disabled={isReadOnly} rows={6} placeholder="Write your response here..."
                className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y disabled:bg-gray-50 disabled:text-gray-600" />
              <p className="text-xs text-gray-400 mt-1">{essay.value.length} characters</p>
            </div>
          ))}

          {/* Document Uploads */}
          {rd.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-[#101661] mb-1">Document Uploads</h2>
              <p className="text-xs text-gray-500 mb-4">
                Only PDF or Word files (.pdf, .doc, .docx) up to 10 MB are accepted.
              </p>
              {uploadError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                  {uploadError}
                </p>
              )}
              <div className="space-y-3">
                {rd.map(docKey => (
                  <div key={docKey} className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-[#101661]">{DOC_LABELS[docKey] || docKey}</p>
                      {docPaths[docKey] ? (
                        <a href={`/api/applications/${id}/docs/${docKey}`} className="text-xs text-[#b51f1f] hover:underline">
                          ✓ Uploaded — Download
                        </a>
                      ) : (
                        <p className="text-xs text-gray-400">PDF or Word only</p>
                      )}
                    </div>
                    {!isReadOnly && (
                      <label className="cursor-pointer bg-white border border-gray-300 hover:border-[#101661] text-sm text-gray-700 px-3 py-1.5 rounded-md transition-colors">
                        {uploading === docKey ? "Uploading..." : docPaths[docKey] ? "Replace" : "Upload"}
                        <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={uploading !== null}
                          onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], docKey); }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end gap-3 pb-8">
              <button onClick={save} disabled={saving}
                className="bg-white border border-gray-300 hover:border-[#101661] text-gray-700 px-6 py-2.5 rounded-md font-medium transition-colors">
                Save Draft
              </button>
              <button onClick={() => setSubmitConfirm(true)}
                className="bg-[#b51f1f] hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-colors">
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>

      {submitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">📤</div>
            <h2 className="text-xl font-bold text-[#101661] mb-2">Submit Application?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Once submitted, you won&apos;t be able to edit your application. Make sure everything is complete before submitting.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSubmitConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Go Back
              </button>
              <button onClick={submit}
                className="flex-1 py-2.5 bg-[#b51f1f] hover:bg-red-700 text-white font-medium rounded-md transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
