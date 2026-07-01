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
  required_fields: string[];
  applicant_school: string | null;
  applicant_year: string | null;
  applicant_birthday: string | null;
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
  required_docs: string[];
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

interface Comment {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_email: string;
  comment: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [essay1Score, setEssay1Score] = useState<number | null>(null);
  const [essay2Score, setEssay2Score] = useState<number | null>(null);
  const [essay3Score, setEssay3Score] = useState<number | null>(null);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [transcriptScore, setTranscriptScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const user = session.user as any;
      if (user.role !== "reviewer") { router.push("/portal"); return; }
      loadApp();
      loadComments();
    }
  }, [status]);

  async function loadApp() {
    const res = await fetch(`/api/applications/${id}`);
    if (!res.ok) { router.push("/reviewer"); return; }
    const data = await res.json();
    setApp(data);
    setEssay1Score(data.essay1_score);
    setEssay2Score(data.essay2_score);
    setEssay3Score(data.essay3_score);
    setResumeScore(data.resume_score);
    setTranscriptScore(data.transcript_score);
  }

  async function loadComments() {
    const res = await fetch(`/api/applications/${id}/comments`);
    if (res.ok) setComments(await res.json());
  }

  async function updateStatus(newStatus: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setApp((a) => a ? { ...a, status: newStatus } : a);
  }

  async function decide(newStatus: "accepted" | "rejected" | "interview_requested") {
    await fetch(`/api/applications/${id}/decision`, {
      method: "POST",
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
      body: JSON.stringify({ score: avgScore, essay1Score, essay2Score, essay3Score, resumeScore, transcriptScore }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/applications/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: newComment }),
    });
    if (res.ok) {
      const created = await res.json();
      setComments(prev => [...prev, created]);
      setNewComment("");
    }
    setPostingComment(false);
  }

  async function deleteComment(commentId: string) {
    await fetch(`/api/applications/${id}/comments/${commentId}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c.id !== commentId));
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
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {app.required_fields?.includes("name") && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.user_name || "—"}</p>
                </div>
              )}
              {app.required_fields?.includes("email") && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.user_email || "—"}</p>
                </div>
              )}
              {app.required_fields?.includes("school") && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">School / University</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.applicant_school || <span className="text-gray-400 italic">Not provided</span>}</p>
                </div>
              )}
              {app.required_fields?.includes("year") && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Year / Grade Level</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{app.applicant_year || <span className="text-gray-400 italic">Not provided</span>}</p>
                </div>
              )}
              {app.required_fields?.includes("birthday") && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">
                    {app.applicant_birthday ? new Date(app.applicant_birthday).toLocaleDateString() : <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Essays — only show those with a configured prompt */}
          {[
            { label: "Essay 1", text: app.essay1, score: essay1Score, setScore: setEssay1Score, prompt: app.essay1_prompt },
            { label: "Essay 2", text: app.essay2, score: essay2Score, setScore: setEssay2Score, prompt: app.essay2_prompt },
            { label: "Essay 3", text: app.essay3, score: essay3Score, setScore: setEssay3Score, prompt: app.essay3_prompt },
          ].filter(e => !!e.prompt).map(({ label, text, score, setScore, prompt }) => (
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
          {(app.required_docs?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-[#101661] mb-4">Submitted Documents</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "resume", label: "Resume", path: app.resume_path, score: resumeScore, setScore: setResumeScore },
                  { key: "transcript", label: "Academic Transcript", path: app.transcript_path, score: transcriptScore, setScore: setTranscriptScore },
                  { key: "cover_letter", label: "Cover Letter", path: app.cover_letter_path, score: null, setScore: null },
                  { key: "rec_letter", label: "Letter of Recommendation", path: app.rec_letter_path, score: null, setScore: null },
                  { key: "financial_need", label: "Proof of Financial Need", path: app.financial_need_path, score: null, setScore: null },
                  { key: "supporting_docs", label: "Supporting Documents", path: app.supporting_docs_path, score: null, setScore: null },
                ].filter(d => app.required_docs?.includes(d.key)).map(({ key, label, path, score, setScore }) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-sm text-[#101661] mb-1">{label}</p>
                    {path ? (
                      <a href={`/api/applications/${app.id}/docs/${key}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#b51f1f] hover:underline">
                        View {label} →
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not uploaded</p>
                    )}
                    {setScore && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Score: <span className="text-[#101661]">{score ?? "Not scored"}</span></p>
                        <ScoreButtons value={score} onChange={setScore} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Reviewer Comments</h2>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic mb-4">No comments yet. Be the first to leave a note.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#101661] flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {c.reviewer_name?.[0]?.toUpperCase() || "R"}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#101661]">{c.reviewer_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                          {c.reviewer_id === (session?.user as any)?.id && (
                            <button onClick={() => deleteComment(c.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={postComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101661]"
              />
              <button type="submit" disabled={postingComment || !newComment.trim()}
                className="bg-[#101661] hover:bg-blue-900 disabled:opacity-40 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors">
                {postingComment ? "Posting..." : "Post"}
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-[#101661] mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveReview}
                disabled={saving}
                className="bg-[#101661] hover:bg-blue-900 disabled:bg-gray-400 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Review"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Reject this application? The student will be notified by email.")) decide("rejected");
                }}
                className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${app.status === "rejected" ? "bg-red-700 text-white ring-2 ring-red-300" : "bg-[#b51f1f] hover:bg-red-700 text-white"}`}
              >
                {app.status === "rejected" ? "✓ Rejected" : "Reject"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Request an interview? The student will be notified by email.")) decide("interview_requested");
                }}
                className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${app.status === "interview_requested" ? "bg-orange-600 text-white ring-2 ring-orange-300" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
              >
                {app.status === "interview_requested" ? "✓ Interview Requested" : "Request Interview"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Accept this application? The student will be notified by email.")) decide("accepted");
                }}
                className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${app.status === "accepted" ? "bg-green-700 text-white ring-2 ring-green-300" : "bg-green-600 hover:bg-green-700 text-white"}`}
              >
                {app.status === "accepted" ? "✓ Accepted" : "Accept"}
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Permanently delete this application from ${app.user_name}? This cannot be undone.`)) {
                    await fetch(`/api/applications/${id}`, { method: "DELETE" });
                    router.push("/reviewer");
                  }
                }}
                className="px-5 py-2.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ml-auto"
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
