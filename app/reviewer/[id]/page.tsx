"use client";
import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

import { reviewerApplicationPageStyles } from "@/styles/pages/reviewer-application";
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
    <div className={reviewerApplicationPageStyles.flex01}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`${reviewerApplicationPageStyles.scoreButton} ${value === n ? reviewerApplicationPageStyles.scoreButtonActive : reviewerApplicationPageStyles.scoreButtonInactive}`}
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
      <div className={reviewerApplicationPageStyles.flex02}>
        <Navbar />
        <div className={reviewerApplicationPageStyles.flextext03}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={reviewerApplicationPageStyles.flex04}>
      <Navbar />
      <div className={reviewerApplicationPageStyles.className05}>
        {/* Header */}
        <div className={reviewerApplicationPageStyles.className06}>
          <Link href="/reviewer" className={reviewerApplicationPageStyles.text07}>← Back to All Applications</Link>
          <div className={reviewerApplicationPageStyles.flex08}>
            <div>
              <h1 className={reviewerApplicationPageStyles.text09}>{app.user_name}</h1>
              <p className={reviewerApplicationPageStyles.text10}>{app.user_email}</p>
              <div className={reviewerApplicationPageStyles.flex11}>
                <span className={`${reviewerApplicationPageStyles.typeBadge} ${app.opportunity_type === "scholarship" ? reviewerApplicationPageStyles.scholarshipBadge : reviewerApplicationPageStyles.internshipBadge}`}>
                  {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
                </span>
                <span className={reviewerApplicationPageStyles.text12}>{app.opportunity_name}</span>
              </div>
              {app.submitted_at && (
                <p className={reviewerApplicationPageStyles.text13}>Submitted {new Date(app.submitted_at).toLocaleDateString()}</p>
              )}
            </div>

            {/* Status changer */}
            <div className={reviewerApplicationPageStyles.className14}>
              <p className={reviewerApplicationPageStyles.text15}>Application Status</p>
              <select
                value={app.status}
                onChange={(e) => updateStatus(e.target.value)}
                className={reviewerApplicationPageStyles.text16}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={reviewerApplicationPageStyles.className17}>
          {/* Personal Information */}
          <div className={reviewerApplicationPageStyles.white18}>
            <h2 className={reviewerApplicationPageStyles.text19}>Applicant Information</h2>
            <div className={reviewerApplicationPageStyles.grid20}>
              {app.required_fields?.includes("name") && (
                <div>
                  <p className={reviewerApplicationPageStyles.text15}>Full Name</p>
                  <p className={reviewerApplicationPageStyles.text21}>{app.user_name || "—"}</p>
                </div>
              )}
              {app.required_fields?.includes("email") && (
                <div>
                  <p className={reviewerApplicationPageStyles.text15}>Email Address</p>
                  <p className={reviewerApplicationPageStyles.text21}>{app.user_email || "—"}</p>
                </div>
              )}
              {app.required_fields?.includes("school") && (
                <div>
                  <p className={reviewerApplicationPageStyles.text15}>School / University</p>
                  <p className={reviewerApplicationPageStyles.text21}>{app.applicant_school || <span className={reviewerApplicationPageStyles.text22}>Not provided</span>}</p>
                </div>
              )}
              {app.required_fields?.includes("year") && (
                <div>
                  <p className={reviewerApplicationPageStyles.text15}>Year / Grade Level</p>
                  <p className={reviewerApplicationPageStyles.text21}>{app.applicant_year || <span className={reviewerApplicationPageStyles.text22}>Not provided</span>}</p>
                </div>
              )}
              {app.required_fields?.includes("birthday") && (
                <div>
                  <p className={reviewerApplicationPageStyles.text15}>Date of Birth</p>
                  <p className={reviewerApplicationPageStyles.text21}>
                    {app.applicant_birthday ? new Date(app.applicant_birthday).toLocaleDateString() : <span className={reviewerApplicationPageStyles.text22}>Not provided</span>}
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
            <div key={label} className={reviewerApplicationPageStyles.white18}>
              <h2 className={reviewerApplicationPageStyles.text23}>{label}</h2>
              <p className={reviewerApplicationPageStyles.text24}>{prompt}</p>
              <div className={reviewerApplicationPageStyles.text25}>
                {text || <span className={reviewerApplicationPageStyles.text22}>No response provided.</span>}
              </div>
              <div className={reviewerApplicationPageStyles.className26}>
                <p className={reviewerApplicationPageStyles.text27}>Score (1–10): <span className={reviewerApplicationPageStyles.text28}>{score ?? "Not scored"}</span></p>
                <ScoreButtons value={score} onChange={setScore} />
              </div>
            </div>
          ))}

          {/* Documents */}
          {(app.required_docs?.length ?? 0) > 0 && (
            <div className={reviewerApplicationPageStyles.white18}>
              <h2 className={reviewerApplicationPageStyles.text19}>Submitted Documents</h2>
              <div className={reviewerApplicationPageStyles.grid29}>
                {[
                  { key: "resume", label: "Resume", path: app.resume_path, score: resumeScore, setScore: setResumeScore },
                  { key: "transcript", label: "Academic Transcript", path: app.transcript_path, score: transcriptScore, setScore: setTranscriptScore },
                  { key: "cover_letter", label: "Cover Letter", path: app.cover_letter_path, score: null, setScore: null },
                  { key: "rec_letter", label: "Letter of Recommendation", path: app.rec_letter_path, score: null, setScore: null },
                  { key: "financial_need", label: "Proof of Financial Need", path: app.financial_need_path, score: null, setScore: null },
                  { key: "supporting_docs", label: "Supporting Documents", path: app.supporting_docs_path, score: null, setScore: null },
                ].filter(d => app.required_docs?.includes(d.key)).map(({ key, label, path, score, setScore }) => (
                  <div key={key} className={reviewerApplicationPageStyles.className30}>
                    <p className={reviewerApplicationPageStyles.text31}>{label}</p>
                    {path ? (
                      <a href={`/api/applications/${app.id}/docs/${key}`} target="_blank" rel="noopener noreferrer" className={reviewerApplicationPageStyles.text32}>
                        View {label} →
                      </a>
                    ) : (
                      <p className={reviewerApplicationPageStyles.text33}>Not uploaded</p>
                    )}
                    {setScore && (
                      <div className={reviewerApplicationPageStyles.className34}>
                        <p className={reviewerApplicationPageStyles.text27}>Score: <span className={reviewerApplicationPageStyles.text28}>{score ?? "Not scored"}</span></p>
                        <ScoreButtons value={score} onChange={setScore} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className={reviewerApplicationPageStyles.white18}>
            <h2 className={reviewerApplicationPageStyles.text19}>Reviewer Comments</h2>
            {comments.length === 0 ? (
              <p className={reviewerApplicationPageStyles.text35}>No comments yet. Be the first to leave a note.</p>
            ) : (
              <div className={reviewerApplicationPageStyles.className36}>
                {comments.map(c => (
                  <div key={c.id} className={reviewerApplicationPageStyles.flex37}>
                    <div className={reviewerApplicationPageStyles.flextext38}>
                      {c.reviewer_name?.[0]?.toUpperCase() || "R"}
                    </div>
                    <div className={reviewerApplicationPageStyles.className39}>
                      <div className={reviewerApplicationPageStyles.flex40}>
                        <span className={reviewerApplicationPageStyles.text41}>{c.reviewer_name}</span>
                        <div className={reviewerApplicationPageStyles.flex42}>
                          <span className={reviewerApplicationPageStyles.text43}>{new Date(c.created_at).toLocaleString()}</span>
                          {c.reviewer_id === (session?.user as any)?.id && (
                            <button onClick={() => deleteComment(c.id)} className={reviewerApplicationPageStyles.text44}>Delete</button>
                          )}
                        </div>
                      </div>
                      <p className={reviewerApplicationPageStyles.text45}>{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={postComment} className={reviewerApplicationPageStyles.flex46}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className={reviewerApplicationPageStyles.text47}
              />
              <button type="submit" disabled={postingComment || !newComment.trim()}
                className={reviewerApplicationPageStyles.text48}>
                {postingComment ? "Posting..." : "Post"}
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className={reviewerApplicationPageStyles.white18}>
            <h2 className={reviewerApplicationPageStyles.text19}>Actions</h2>
            <div className={reviewerApplicationPageStyles.flex49}>
              <button
                onClick={saveReview}
                disabled={saving}
                className={reviewerApplicationPageStyles.text50}
              >
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Review"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Reject this application? The student will be notified by email.")) decide("rejected");
                }}
                className={`${reviewerApplicationPageStyles.decisionButton} ${app.status === "rejected" ? reviewerApplicationPageStyles.rejectButtonActive : reviewerApplicationPageStyles.rejectButtonInactive}`}
              >
                {app.status === "rejected" ? "✓ Rejected" : "Reject"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Request an interview? The student will be notified by email.")) decide("interview_requested");
                }}
                className={`${reviewerApplicationPageStyles.decisionButton} ${app.status === "interview_requested" ? reviewerApplicationPageStyles.interviewButtonActive : reviewerApplicationPageStyles.interviewButtonInactive}`}
              >
                {app.status === "interview_requested" ? "✓ Interview Requested" : "Request Interview"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Accept this application? The student will be notified by email.")) decide("accepted");
                }}
                className={`${reviewerApplicationPageStyles.decisionButton} ${app.status === "accepted" ? reviewerApplicationPageStyles.acceptButtonActive : reviewerApplicationPageStyles.acceptButtonInactive}`}
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
                className={reviewerApplicationPageStyles.text51}
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
