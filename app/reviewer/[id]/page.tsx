"use client";
import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface Application {
  id: string;
  user_name: string;
  user_email: string;
  opportunity_name: string;
  opportunity_type: string;
  status: string;
  essay1: string | null;
  essay2: string | null;
  essay3: string | null;
  resume_path: string | null;
  transcript_path: string | null;
  score: number | null;
  review_notes: string | null;
  essay1_score: number | null;
  essay2_score: number | null;
  essay3_score: number | null;
  resume_score: number | null;
  transcript_score: number | null;
  submitted_at: string | null;
  created_at: string;
}

const STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "interview_requested", label: "Interview Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function ScoreButtons({ value, onChange, disabled }: { value: number | null; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            value === n
              ? "bg-[#101661] text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function ReviewApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [essay1Score, setEssay1Score] = useState<number | null>(null);
  const [essay2Score, setEssay2Score] = useState<number | null>(null);
  const [essay3Score, setEssay3Score] = useState<number | null>(null);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [transcriptScore, setTranscriptScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      loadApp();
    }
  }, [status]);

  async function loadApp() {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) { router.push("/reviewer"); return; }
    const data = await res.json();
    setApp(data);
    setNotes(data.review_notes || "");
    setEssay1Score(data.essay1_score);
    setEssay2Score(data.essay2_score);
    setEssay3Score(data.essay3_score);
    setResumeScore(data.resume_score);
    setTranscriptScore(data.transcript_score);
  }

  async function updateStatus(newStatus: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setApp((a) => a ? { ...a, status: newStatus } : a);
  }

  async function saveReview() {
    setSaving(true);
    const scores = [essay1Score, essay2Score, essay3Score, resumeScore, transcriptScore].filter(Boolean) as number[];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : null;
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewNotes: notes,
        score: avgScore,
        essay1Score, essay2Score, essay3Score, resumeScore, transcriptScore,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function notifyStudent() {
    setNotifying(true);
    await fetch(`/api/applications/${id}/notify`, { method: "POST" });
    setNotifying(false);
    setNotified(true);
    setApp((a) => a ? { ...a, status: "interview_requested" } : a);
  }

  if (!app) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
        {/* Header */}
        <div className="mb-6">
          <Link href="/reviewer" className="text-sm text-[#101661] hover:underline">← Back to All Applications</Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mt-3 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#101661]">{app.user_name}</h1>
              <p className="text-gray-500">{app.user_email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${app.opportunity_type === "scholarship" ? "bg-blue-50 text-[#101661] border-blue-200" : "bg-purple-50 text-purple-800 border-purple-200"}`}>
                  {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                </span>
                <span className="text-sm text-gray-600 font-medium">{app.opportunity_name}</span>
              </div>
              {app.submitted_at && (
                <p className="text-xs text-gray-400 mt-1">Submitted {new Date(app.submitted_at).toLocaleDateString()}</p>
              )}
            </div>

            {/* Status changer */}
            <div className="shrink-0">
              <p className="text-xs font-medium text-gray-500 mb-1">Application Status</p>
              <select
                value={app.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] font-medium"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Essays */}
          {[
            { label: "Essay 1 — About Yourself", text: app.essay1, score: essay1Score, setScore: setEssay1Score, prompt: "Tell us about yourself and why you are interested in this opportunity." },
            { label: "Essay 2 — Leadership & Impact", text: app.essay2, score: essay2Score, setScore: setEssay2Score, prompt: "Describe a time you demonstrated leadership or made an impact in your community." },
            { label: "Essay 3 — Future Goals", text: app.essay3, score: essay3Score, setScore: setEssay3Score, prompt: "What are your future goals and how will this opportunity help you achieve them?" },
          ].map(({ label, text, score, setScore, prompt }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-[#101661] mb-0.5">{label}</h2>
              <p className="text-xs text-gray-400 mb-3 italic">{prompt}</p>
              <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap leading-relaxed">
                {text || <span className="text-gray-400 italic">No response provided.</span>}
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Score (1–10): <span className="text-[#101661]">{score ?? "Not scored"}</span></p>
                <ScoreButtons value={score} onChange={setScore} />
              </div>
            </div>
          ))}

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Submitted Documents</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium text-sm text-[#101661] mb-1">Resume</p>
                {app.resume_path ? (
                  <a href={app.resume_path} target="_blank" rel="noopener noreferrer" className="text-sm text-[#b51f1f] hover:underline">
                    View Resume →
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not uploaded</p>
                )}
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500">Score: <span className="text-[#101661]">{resumeScore ?? "Not scored"}</span></p>
                  <ScoreButtons value={resumeScore} onChange={setResumeScore} />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium text-sm text-[#101661] mb-1">Transcript</p>
                {app.transcript_path ? (
                  <a href={app.transcript_path} target="_blank" rel="noopener noreferrer" className="text-sm text-[#b51f1f] hover:underline">
                    View Transcript →
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not uploaded</p>
                )}
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500">Score: <span className="text-[#101661]">{transcriptScore ?? "Not scored"}</span></p>
                  <ScoreButtons value={transcriptScore} onChange={setTranscriptScore} />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-3">Reviewer Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this application..."
              className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661] resize-y"
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Actions</h2>
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Application Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(s.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                      app.status === s.value
                        ? "bg-[#101661] text-white border-[#101661]"
                        : "bg-white text-gray-600 border-gray-300 hover:border-[#101661] hover:text-[#101661]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={saveReview}
                disabled={saving}
                className="bg-[#101661] hover:bg-blue-900 disabled:bg-gray-400 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Review"}
              </button>
              <button
                onClick={notifyStudent}
                disabled={notifying || notified || app.status === "interview_requested"}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                {notified || app.status === "interview_requested"
                  ? "✓ Student Notified"
                  : notifying
                  ? "Notifying..."
                  : "Request Interview & Notify Student"}
              </button>
            </div>
            {(notified || app.status === "interview_requested") && (
              <p className="text-sm text-orange-600 mt-3 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                ✉️ The student has been notified of the interview request. The team will email them to schedule a meeting.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
