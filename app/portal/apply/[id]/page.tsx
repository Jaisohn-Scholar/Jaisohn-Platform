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
  resume_path: string | null;
  transcript_path: string | null;
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [essay1, setEssay1] = useState("");
  const [essay2, setEssay2] = useState("");
  const [essay3, setEssay3] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [transcriptPath, setTranscriptPath] = useState<string | null>(null);
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
    setResumePath(data.resume_path);
    setTranscriptPath(data.transcript_path);
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
      body: JSON.stringify({ essay1, essay2, essay3 }),
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
      body: JSON.stringify({ essay1, essay2, essay3, submit: true }),
    });
    setSaving(false);
    setSubmitConfirm(false);
    router.push("/portal");
  }

  async function uploadFile(file: File, type: "resume" | "transcript") {
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/applications/${id}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (type === "resume") setResumePath(data.path);
    else setTranscriptPath(data.path);
    setUploading(null);
  }

  if (!app) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  const isReadOnly = app.status !== "in_progress";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        {/* Header */}
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

        {/* Save status */}
        {!isReadOnly && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400">
              {saving ? "Saving..." : saved ? "✓ Saved" : "Changes are autosaved"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="text-sm bg-white border border-gray-300 hover:border-[#101661] text-gray-700 px-4 py-1.5 rounded-md transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => setSubmitConfirm(true)}
                className="text-sm bg-[#b51f1f] hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition-colors font-medium"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Essay 1 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-1">Essay Question 1</h2>
            <p className="text-gray-500 text-sm mb-3">
              Tell us about yourself and why you are interested in this {app.opportunity_type}.
            </p>
            <textarea
              value={essay1}
              onChange={(e) => { setEssay1(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
              disabled={isReadOnly}
              rows={6}
              placeholder="Write your response here..."
              className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y disabled:bg-gray-50 disabled:text-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">{essay1.length} characters</p>
          </div>

          {/* Essay 2 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-1">Essay Question 2</h2>
            <p className="text-gray-500 text-sm mb-3">
              Describe a time you demonstrated leadership or made an impact in your community.
            </p>
            <textarea
              value={essay2}
              onChange={(e) => { setEssay2(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
              disabled={isReadOnly}
              rows={6}
              placeholder="Write your response here..."
              className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y disabled:bg-gray-50 disabled:text-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">{essay2.length} characters</p>
          </div>

          {/* Essay 3 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-1">Essay Question 3</h2>
            <p className="text-gray-500 text-sm mb-3">
              What are your future goals and how will this {app.opportunity_type} help you achieve them?
            </p>
            <textarea
              value={essay3}
              onChange={(e) => { setEssay3(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
              disabled={isReadOnly}
              rows={6}
              placeholder="Write your response here..."
              className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y disabled:bg-gray-50 disabled:text-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">{essay3.length} characters</p>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Document Uploads</h2>
            <div className="space-y-4">
              {/* Resume */}
              <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-[#101661]">Resume</p>
                  {resumePath ? (
                    <a href={resumePath} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b51f1f] hover:underline">
                      ✓ Uploaded — View
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">PDF, DOC, or DOCX</p>
                  )}
                </div>
                {!isReadOnly && (
                  <label className="cursor-pointer bg-white border border-gray-300 hover:border-[#101661] text-sm text-gray-700 px-3 py-1.5 rounded-md transition-colors">
                    {uploading === "resume" ? "Uploading..." : resumePath ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0], "resume"); }}
                    />
                  </label>
                )}
              </div>

              {/* Transcript */}
              <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-[#101661]">Academic Transcript</p>
                  {transcriptPath ? (
                    <a href={transcriptPath} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b51f1f] hover:underline">
                      ✓ Uploaded — View
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">PDF preferred</p>
                  )}
                </div>
                {!isReadOnly && (
                  <label className="cursor-pointer bg-white border border-gray-300 hover:border-[#101661] text-sm text-gray-700 px-3 py-1.5 rounded-md transition-colors">
                    {uploading === "transcript" ? "Uploading..." : transcriptPath ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0], "transcript"); }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-3 pb-8">
              <button
                onClick={save}
                disabled={saving}
                className="bg-white border border-gray-300 hover:border-[#101661] text-gray-700 px-6 py-2.5 rounded-md font-medium transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => setSubmitConfirm(true)}
                className="bg-[#b51f1f] hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-colors"
              >
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {submitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">📤</div>
            <h2 className="text-xl font-bold text-[#101661] mb-2">Submit Application?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Once submitted, you won&apos;t be able to edit your application. Make sure everything is complete before submitting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={submit}
                className="flex-1 py-2.5 bg-[#b51f1f] hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
