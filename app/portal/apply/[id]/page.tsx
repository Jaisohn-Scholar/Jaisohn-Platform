"use client";
import { use, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

import { portalApplyPageStyles } from "@/styles/pages/portal-apply";
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
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`/api/applications/${id}/upload`, { method: "POST", body: formData });
    const data = await res.json();
    setDocPaths(prev => ({ ...prev, [type]: data.path }));
    setUploading(null);
  }

  if (!app) return (
    <div className={portalApplyPageStyles.flex01}><Navbar />
      <div className={portalApplyPageStyles.flextext02}>Loading...</div>
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
    <div className={portalApplyPageStyles.flex03}>
      <Navbar />
      <div className={portalApplyPageStyles.className04}>
        <div className={portalApplyPageStyles.className05}>
          <Link href="/portal" className={portalApplyPageStyles.text06}>← Back to My Applications</Link>
          <div className={portalApplyPageStyles.flex07}>
            <span className={`${portalApplyPageStyles.typeBadge} ${app.opportunity_type === "scholarship" ? portalApplyPageStyles.scholarshipBadge : portalApplyPageStyles.internshipBadge}`}>
              {app.opportunity_type === "scholarship" ? "🎓 Scholarship" : "💼 Internship"}
            </span>
          </div>
          <h1 className={portalApplyPageStyles.text08}>{app.opportunity_name}</h1>
          {isReadOnly && (
            <div className={portalApplyPageStyles.text09}>
              This application has been submitted and is read-only.
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div className={portalApplyPageStyles.flex10}>
            <span className={portalApplyPageStyles.text11}>
              {saving ? "Saving..." : saved ? "✓ Saved" : "Changes are autosaved"}
            </span>
            <div className={portalApplyPageStyles.flex12}>
              <button onClick={save} disabled={saving}
                className={portalApplyPageStyles.whitetext13}>
                Save Draft
              </button>
              <button onClick={() => setSubmitConfirm(true)}
                className={portalApplyPageStyles.text14}>
                Submit Application
              </button>
            </div>
          </div>
        )}

        <div className={portalApplyPageStyles.className15}>
          {/* Applicant Info — always show name/email, plus optional fields */}
          <div className={portalApplyPageStyles.white16}>
            <h2 className={portalApplyPageStyles.text17}>Applicant Information</h2>
            <div className={portalApplyPageStyles.grid18}>
              {rf.includes("name") && (
                <div>
                  <label className={portalApplyPageStyles.text19}>Full Name</label>
                  <p className={portalApplyPageStyles.text20}>{app.user_name}</p>
                </div>
              )}
              {rf.includes("email") && (
                <div>
                  <label className={portalApplyPageStyles.text19}>Email Address</label>
                  <p className={portalApplyPageStyles.text20}>{app.user_email}</p>
                </div>
              )}
              {needsSchool && (
                <div className={portalApplyPageStyles.className21}>
                  <label className={portalApplyPageStyles.text19}>School / University</label>
                  <input value={school} onChange={e => { setSchool(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly} placeholder="e.g. University of Pennsylvania"
                    className={portalApplyPageStyles.text22} />
                </div>
              )}
              {needsYear && (
                <div>
                  <label className={portalApplyPageStyles.text19}>Year / Grade Level</label>
                  <input value={year} onChange={e => { setYear(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly} placeholder="e.g. Junior, 3rd Year"
                    className={portalApplyPageStyles.text22} />
                </div>
              )}
              {needsBirthday && (
                <div>
                  <label className={portalApplyPageStyles.text19}>Date of Birth</label>
                  <input type="date" value={birthday} onChange={e => { setBirthday(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                    disabled={isReadOnly}
                    className={portalApplyPageStyles.text22} />
                </div>
              )}
            </div>
          </div>

          {/* Essays */}
          {essays.map((essay, i) => essay.enabled && (
            <div key={i} className={portalApplyPageStyles.white16}>
              <h2 className={portalApplyPageStyles.text23}>Essay Question {i + 1}</h2>
              <p className={portalApplyPageStyles.text24}>{essay.prompt}</p>
              <textarea value={essay.value}
                onChange={e => { essay.set(e.target.value); if (!isReadOnly) triggerAutoSave(); }}
                disabled={isReadOnly} rows={6} placeholder="Write your response here..."
                className={portalApplyPageStyles.text25} />
              <p className={portalApplyPageStyles.text26}>{essay.value.length} characters</p>
            </div>
          ))}

          {/* Document Uploads */}
          {rd.length > 0 && (
            <div className={portalApplyPageStyles.white16}>
              <h2 className={portalApplyPageStyles.text17}>Document Uploads</h2>
              <div className={portalApplyPageStyles.className27}>
                {rd.map(docKey => (
                  <div key={docKey} className={portalApplyPageStyles.flex28}>
                    <div>
                      <p className={portalApplyPageStyles.text29}>{DOC_LABELS[docKey] || docKey}</p>
                      {docPaths[docKey] ? (
                        <a href={docPaths[docKey]!} target="_blank" rel="noopener noreferrer" className={portalApplyPageStyles.text30}>
                          ✓ Uploaded — View
                        </a>
                      ) : (
                        <p className={portalApplyPageStyles.text11}>PDF, DOC, or DOCX</p>
                      )}
                    </div>
                    {!isReadOnly && (
                      <label className={portalApplyPageStyles.whitetext31}>
                        {uploading === docKey ? "Uploading..." : docPaths[docKey] ? "Replace" : "Upload"}
                        <input type="file" accept=".pdf,.doc,.docx" className={portalApplyPageStyles.className32} disabled={uploading !== null}
                          onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], docKey); }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className={portalApplyPageStyles.flex33}>
              <button onClick={save} disabled={saving}
                className={portalApplyPageStyles.whitetext34}>
                Save Draft
              </button>
              <button onClick={() => setSubmitConfirm(true)}
                className={portalApplyPageStyles.text35}>
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>

      {submitConfirm && (
        <div className={portalApplyPageStyles.fixedflex36}>
          <div className={portalApplyPageStyles.whitetext37}>
            <div className={portalApplyPageStyles.text38}>📤</div>
            <h2 className={portalApplyPageStyles.text39}>Submit Application?</h2>
            <p className={portalApplyPageStyles.text40}>
              Once submitted, you won&apos;t be able to edit your application. Make sure everything is complete before submitting.
            </p>
            <div className={portalApplyPageStyles.flex41}>
              <button onClick={() => setSubmitConfirm(false)}
                className={portalApplyPageStyles.text42}>
                Go Back
              </button>
              <button onClick={submit}
                className={portalApplyPageStyles.text43}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
